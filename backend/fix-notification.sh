#!/bin/bash

# Colors for better readability
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Fixing SQL Reserved Keyword Issue in Notification Entity${NC}"

# Check if the Notification.java file exists
NOTIFICATION_FILE="src/main/java/com/attendanceiq/api/models/Notification.java"
if [ ! -f "$NOTIFICATION_FILE" ]; then
    echo -e "${RED}Error: Notification.java file not found at $NOTIFICATION_FILE${NC}"
    exit 1
fi

# Create a backup of the original file
cp "$NOTIFICATION_FILE" "${NOTIFICATION_FILE}.bak"
echo -e "${GREEN}Created backup at ${NOTIFICATION_FILE}.bak${NC}"

# Read the file content
file_content=$(cat "$NOTIFICATION_FILE")

# Check for the problematic field declaration
if grep -q "private boolean read;" "$NOTIFICATION_FILE"; then
    echo -e "${YELLOW}Found problematic 'read' field - this is a reserved SQL keyword${NC}"
    
    # Replace the field declaration to use Column annotation with proper SQL escape
    sed -i 's/private boolean read;/@Column(name = "`read`")\n    private boolean read;/g' "$NOTIFICATION_FILE"
    
    # Alternative approach: rename the field to isRead
    # sed -i 's/private boolean read;/private boolean isRead;/g' "$NOTIFICATION_FILE"
    # Then update all usages of read to isRead
    # sed -i 's/isRead(/getIsRead(/g' "$NOTIFICATION_FILE"
    # sed -i 's/setRead(/setIsRead(/g' "$NOTIFICATION_FILE"
    
    # Check if we need to add the import for Column
    if ! grep -q "import jakarta.persistence.Column;" "$NOTIFICATION_FILE"; then
        sed -i '1,/^package/!{/^import/!{/^package/{a\
import jakarta.persistence.Column;
};}}' "$NOTIFICATION_FILE"
    fi
    
    echo -e "${GREEN}Modified Notification.java to properly escape the 'read' column name${NC}"
else
    echo -e "${YELLOW}Did not find 'private boolean read;' in the file.${NC}"
    echo -e "${YELLOW}Checking for alternative field declarations...${NC}"
    
    # Try to find any field related to 'read' status
    read_fields=$(grep -E "private\s+boolean\s+(read|isRead|readStatus)" "$NOTIFICATION_FILE")
    
    if [ -n "$read_fields" ]; then
        echo -e "${YELLOW}Found field(s) that might be related to read status:${NC}"
        echo "$read_fields"
        echo -e "${YELLOW}Attempting to fix by adding @Column annotation...${NC}"
        
        # Replace any read-related field with properly annotated version
        sed -i 's/private boolean read;/@Column(name = "`read`")\n    private boolean read;/g' "$NOTIFICATION_FILE"
        sed -i 's/private boolean isRead;/@Column(name = "is_read")\n    private boolean isRead;/g' "$NOTIFICATION_FILE"
        sed -i 's/private boolean readStatus;/@Column(name = "read_status")\n    private boolean readStatus;/g' "$NOTIFICATION_FILE"
        
        # Check if we need to add the import for Column
        if ! grep -q "import jakarta.persistence.Column;" "$NOTIFICATION_FILE"; then
            sed -i '1,/^package/!{/^import/!{/^package/{a\
import jakarta.persistence.Column;
};}}' "$NOTIFICATION_FILE"
        fi
        
        echo -e "${GREEN}Added Column annotations to read-related fields${NC}"
    else
        echo -e "${RED}Could not find any read-related fields in the file.${NC}"
        
        # Manual fix instructions
        echo -e "${YELLOW}Manual fix required. Here's what you need to do:${NC}"
        echo -e "1. Open ${NOTIFICATION_FILE}"
        echo -e "2. Find the field that represents the 'read' status of notifications"
        echo -e "3. Add the following annotation above the field:"
        echo -e "   @Column(name = \"\`read\`\") // If the field is named 'read'"
        echo -e "   or"
        echo -e "   @Column(name = \"is_read\") // If you rename the field to 'isRead'"
        echo -e "4. Make sure the import for Column is present:"
        echo -e "   import jakarta.persistence.Column;"
    fi
fi

echo -e "${GREEN}Fix complete. Try building and running your application again.${NC}"
echo -e "${YELLOW}If the issue persists, you may need to manually modify the entity class.${NC}"
