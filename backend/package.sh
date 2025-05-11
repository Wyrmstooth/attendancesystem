#!/bin/bash

# Colors for better readability
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting package declaration fix script...${NC}"

# Find all Java files in the project
echo -e "${YELLOW}Finding all Java files...${NC}"
JAVA_FILES=$(find ./src -name "*.java")
FILE_COUNT=$(echo "$JAVA_FILES" | wc -l)

echo -e "${GREEN}Found $FILE_COUNT Java files to process${NC}"

# Create Role enum if it doesn't exist
if [ ! -f "./src/main/java/com/attendanceiq/api/models/Role.java" ]; then
    echo -e "${YELLOW}Creating Role.java enum...${NC}"
    mkdir -p ./src/main/java/com/attendanceiq/api/models
    cat > ./src/main/java/com/attendanceiq/api/models/Role.java << 'EOF'
package com.attendanceiq.api.models;

public enum Role {
    STUDENT,
    INSTRUCTOR,
    ADMIN,
    PARENT
}
EOF
    echo -e "${GREEN}Created Role enum${NC}"
fi

# Process each file
COUNT=0
FIXED=0

for file in $JAVA_FILES; do
    COUNT=$((COUNT+1))
    
    # Check if the file has the wrong package declaration
    if grep -q "package main.java.com.attendanceiq" "$file"; then
        # Make a backup of the original file
        cp "$file" "${file}.bak"
        
        # Fix the package declaration
        sed -i 's/package main.java.com.attendanceiq/package com.attendanceiq/g' "$file"
        
        # Fix any imports that reference the wrong package
        sed -i 's/import main.java.com.attendanceiq/import com.attendanceiq/g' "$file"
        
        echo -e "${GREEN}Fixed:${NC} $file"
        FIXED=$((FIXED+1))
    fi
    
    # Show progress
    if [ $((COUNT % 10)) -eq 0 ] || [ $COUNT -eq $FILE_COUNT ]; then
        echo -e "${YELLOW}Progress: $COUNT/$FILE_COUNT files processed${NC}"
    fi
done

echo -e "${GREEN}Package fix complete!${NC}"
echo -e "${GREEN}Fixed $FIXED out of $FILE_COUNT files${NC}"

# Check if there are any lombok annotations that might need the library
if grep -r "@Data\|@Builder\|@AllArgsConstructor\|@NoArgsConstructor\|@RequiredArgsConstructor\|@Slf4j" --include="*.java" ./src; then
    echo -e "${YELLOW}Lombok annotations found. Make sure lombok dependency is properly configured in pom.xml${NC}"
fi

echo -e "${GREEN}You can now try building your project again with:${NC}"
echo -e "${YELLOW}mvn clean spring-boot:run${NC}"
