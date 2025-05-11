#!/bin/bash

# Colors for better readability
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Adding Lombok annotations to DTO classes...${NC}"

# Find all DTO files
DTO_FILES=$(find ./src -name "*Dto.java")

if [ -z "$DTO_FILES" ]; then
    echo -e "${RED}No DTO files found!${NC}"
    exit 1
fi

echo -e "${GREEN}Found $(echo "$DTO_FILES" | wc -l) DTO files${NC}"

# Process each DTO file
for file in $DTO_FILES; do
    echo -e "${YELLOW}Processing $file...${NC}"
    
    # Create a backup
    cp "$file" "${file}.bak"
    
    # Add lombok import if not present
    if ! grep -q "import lombok.Data;" "$file"; then
        sed -i '1,/^package/s/^package.*/&\n\nimport lombok.Data;\nimport lombok.Builder;\nimport lombok.NoArgsConstructor;\nimport lombok.AllArgsConstructor;/' "$file"
    fi
    
    # Add lombok annotations if not present
    if ! grep -q "@Data" "$file"; then
        CLASS_LINE=$(grep -n "public class" "$file" | cut -d: -f1)
        if [ -n "$CLASS_LINE" ]; then
            sed -i "${CLASS_LINE}i @Data\n@Builder\n@NoArgsConstructor\n@AllArgsConstructor" "$file"
            echo -e "${GREEN}Added Lombok annotations to $(basename "$file")${NC}"
        else
            echo -e "${RED}Could not find class declaration in $(basename "$file")${NC}"
        fi
    else
        echo -e "${GREEN}Lombok annotations already present in $(basename "$file")${NC}"
    fi
done

echo -e "${GREEN}Finished processing DTO classes${NC}"

# Also check model classes
echo -e "${YELLOW}Now checking model classes...${NC}"
MODEL_FILES=$(find ./src -name "*.java" -path "*/models/*" | grep -v "enum")

if [ -z "$MODEL_FILES" ]; then
    echo -e "${RED}No model files found!${NC}"
else
    echo -e "${GREEN}Found $(echo "$MODEL_FILES" | wc -l) model files${NC}"
    
    # Process each model file
    for file in $MODEL_FILES; do
        # Skip enums
        if grep -q "public enum" "$file"; then
            echo -e "${YELLOW}Skipping enum file: $(basename "$file")${NC}"
            continue
        fi
        
        echo -e "${YELLOW}Processing model file: $(basename "$file")...${NC}"
        
        # Create a backup
        cp "$file" "${file}.bak"
        
        # Add lombok import if not present
        if ! grep -q "import lombok.Data;" "$file"; then
            sed -i '1,/^package/s/^package.*/&\n\nimport lombok.Data;\nimport lombok.Builder;\nimport lombok.NoArgsConstructor;\nimport lombok.AllArgsConstructor;/' "$file"
        fi
        
        # Add lombok annotations if not present
        if ! grep -q "@Data" "$file"; then
            CLASS_LINE=$(grep -n "public class" "$file" | cut -d: -f1)
            if [ -n "$CLASS_LINE" ]; then
                sed -i "${CLASS_LINE}i @Data\n@Builder\n@NoArgsConstructor\n@AllArgsConstructor" "$file"
                echo -e "${GREEN}Added Lombok annotations to $(basename "$file")${NC}"
            else
                echo -e "${RED}Could not find class declaration in $(basename "$file")${NC}"
            fi
        else
            echo -e "${GREEN}Lombok annotations already present in $(basename "$file")${NC}"
        fi
    done
fi

echo -e "${GREEN}Finished adding Lombok annotations${NC}"
echo -e "${YELLOW}Now run:${NC}"
echo -e "  mvn clean install -DskipTests"
echo -e "${YELLOW}to rebuild the project with Lombok${NC}"
