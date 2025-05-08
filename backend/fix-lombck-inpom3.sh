#!/bin/bash

# Colors for better readability
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Fixing SLF4J log variable issues...${NC}"

# Find classes with @Slf4j annotation but missing the import
FILES_WITH_LOG=$(grep -l "log\." $(find ./src -name "*.java"))

if [ -z "$FILES_WITH_LOG" ]; then
    echo -e "${YELLOW}No files found with log variable usage${NC}"
else
    echo -e "${GREEN}Found $(echo "$FILES_WITH_LOG" | wc -l) files using log variable${NC}"
    
    for file in $FILES_WITH_LOG; do
        echo -e "${YELLOW}Processing $file...${NC}"
        
        # Create a backup
        cp "$file" "${file}.bak"
        
        # Check if the file already has the @Slf4j annotation
        if ! grep -q "@Slf4j" "$file"; then
            # Add the Slf4j import and annotation
            if grep -q "import lombok.Data;" "$file"; then
                # If there are already Lombok imports, add it there
                sed -i 's/import lombok.Data;/import lombok.Data;\nimport lombok.extern.slf4j.Slf4j;/' "$file"
            else
                # Otherwise add it after the package declaration
                sed -i '1,/^package/s/^package.*/&\n\nimport lombok.extern.slf4j.Slf4j;/' "$file"
            fi
            
            # Add the @Slf4j annotation before the class declaration
            CLASS_LINE=$(grep -n "public class" "$file" | cut -d: -f1)
            if [ -n "$CLASS_LINE" ]; then
                sed -i "${CLASS_LINE}i @Slf4j" "$file"
                echo -e "${GREEN}Added @Slf4j annotation to $(basename "$file")${NC}"
            else
                echo -e "${RED}Could not find class declaration in $(basename "$file")${NC}"
            fi
        else
            echo -e "${GREEN}@Slf4j annotation already present in $(basename "$file")${NC}"
        fi
    done
fi

# Now specifically add the @Slf4j annotation to EmailService and DataInitializer
EMAIL_SERVICE="./src/main/java/com/attendanceiq/api/services/EmailService.java"
if [ -f "$EMAIL_SERVICE" ]; then
    echo -e "${YELLOW}Adding @Slf4j to EmailService...${NC}"
    cp "$EMAIL_SERVICE" "${EMAIL_SERVICE}.bak"
    
    if ! grep -q "@Slf4j" "$EMAIL_SERVICE"; then
        # Add the import if not already present
        if ! grep -q "import lombok.extern.slf4j.Slf4j;" "$EMAIL_SERVICE"; then
            sed -i '1,/^package/s/^package.*/&\n\nimport lombok.extern.slf4j.Slf4j;/' "$EMAIL_SERVICE"
        fi
        
        # Add the annotation
        CLASS_LINE=$(grep -n "public class" "$EMAIL_SERVICE" | cut -d: -f1)
        if [ -n "$CLASS_LINE" ]; then
            sed -i "${CLASS_LINE}i @Slf4j" "$EMAIL_SERVICE"
            echo -e "${GREEN}Added @Slf4j annotation to EmailService${NC}"
        else
            echo -e "${RED}Could not find class declaration in EmailService${NC}"
        fi
    else
        echo -e "${GREEN}@Slf4j annotation already present in EmailService${NC}"
    fi
else
    echo -e "${RED}EmailService file not found!${NC}"
fi

DATA_INITIALIZER="./src/main/java/com/attendanceiq/api/config/DataInitializer.java"
if [ -f "$DATA_INITIALIZER" ]; then
    echo -e "${YELLOW}Adding @Slf4j to DataInitializer...${NC}"
    cp "$DATA_INITIALIZER" "${DATA_INITIALIZER}.bak"
    
    if ! grep -q "@Slf4j" "$DATA_INITIALIZER"; then
        # Add the import if not already present
        if ! grep -q "import lombok.extern.slf4j.Slf4j;" "$DATA_INITIALIZER"; then
            sed -i '1,/^package/s/^package.*/&\n\nimport lombok.extern.slf4j.Slf4j;/' "$DATA_INITIALIZER"
        fi
        
        # Add the annotation
        CLASS_LINE=$(grep -n "public class" "$DATA_INITIALIZER" | cut -d: -f1)
        if [ -n "$CLASS_LINE" ]; then
            sed -i "${CLASS_LINE}i @Slf4j" "$DATA_INITIALIZER"
            echo -e "${GREEN}Added @Slf4j annotation to DataInitializer${NC}"
        else
            echo -e "${RED}Could not find class declaration in DataInitializer${NC}"
        fi
    else
        echo -e "${GREEN}@Slf4j annotation already present in DataInitializer${NC}"
    fi
else
    echo -e "${RED}DataInitializer file not found!${NC}"
fi

echo -e "${GREEN}Finished fixing SLF4J issues${NC}"
