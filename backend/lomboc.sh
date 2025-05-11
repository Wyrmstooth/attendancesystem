#!/bin/bash

# Colors for better readability
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Setting up Lombok configuration...${NC}"

# Check if lombok.jar exists in the maven repo
LOMBOK_PATH=$(find ~/.m2 -name "lombok-*.jar" | head -1)

if [ -z "$LOMBOK_PATH" ]; then
    echo -e "${YELLOW}Lombok JAR not found in Maven repository.${NC}"
    echo -e "${YELLOW}Let's download it directly...${NC}"
    
    # Create a directory for the lombok jar
    mkdir -p libs
    cd libs
    
    # Download the latest lombok jar
    echo -e "${YELLOW}Downloading Lombok...${NC}"
    curl -L https://projectlombok.org/downloads/lombok.jar -o lombok.jar
    
    LOMBOK_PATH="$(pwd)/lombok.jar"
    cd ..
    
    echo -e "${GREEN}Lombok JAR downloaded to $LOMBOK_PATH${NC}"
fi

# Create or update lombok.config
echo -e "${YELLOW}Creating lombok.config file...${NC}"
cat > lombok.config << EOL
# This file is generated - additional Lombok configuration
config.stopBubbling = true
lombok.addLombokGeneratedAnnotation = true
lombok.anyConstructor.addConstructorProperties = true
lombok.accessors.chain = true
EOL

echo -e "${GREEN}lombok.config created successfully${NC}"

# Update the pom.xml to include Lombok as a dependency
echo -e "${YELLOW}Checking pom.xml for Lombok dependency...${NC}"
if ! grep -q "org.projectlombok" pom.xml; then
    echo -e "${YELLOW}Adding Lombok dependency to pom.xml...${NC}"
    
    # Create backup
    cp pom.xml pom.xml.bak
    
    # Use sed to add the Lombok dependency before the closing </dependencies> tag
    sed -i '/<\/dependencies>/i \
        <dependency>\
            <groupId>org.projectlombok<\/groupId>\
            <artifactId>lombok<\/artifactId>\
            <version>1.18.30<\/version>\
            <scope>provided<\/scope>\
        <\/dependency>' pom.xml
    
    echo -e "${GREEN}Lombok dependency added to pom.xml${NC}"
else
    echo -e "${GREEN}Lombok dependency already exists in pom.xml${NC}"
fi

# Fix the User class to implement UserDetails methods
echo -e "${YELLOW}Fixing User class to implement UserDetails methods...${NC}"
USER_FILE="src/main/java/com/attendanceiq/api/models/User.java"

if [ -f "$USER_FILE" ]; then
    # Create backup
    cp "$USER_FILE" "${USER_FILE}.bak"
    
    # Check if the class already has getUsername method implemented
    if ! grep -q "public String getUsername()" "$USER_FILE"; then
        # Add the UserDetails methods before the closing brace of the class
        sed -i '/^}$/i \
    @Override\
    public String getPassword() {\
        return password;\
    }\
\
    @Override\
    public String getUsername() {\
        return username;\
    }\
\
    @Override\
    public boolean isAccountNonExpired() {\
        return true;\
    }\
\
    @Override\
    public boolean isAccountNonLocked() {\
        return true;\
    }\
\
    @Override\
    public boolean isCredentialsNonExpired() {\
        return true;\
    }\
\
    @Override\
    public boolean isEnabled() {\
        return true;\
    }\
' "$USER_FILE"
        
        echo -e "${GREEN}UserDetails methods added to User class${NC}"
    else
        echo -e "${GREEN}User class already has UserDetails methods${NC}"
    fi
    
    # Fix Lombok annotation if they appear to be missing
    if ! grep -q "@Data" "$USER_FILE"; then
        sed -i '/^public class User/i \@Data' "$USER_FILE"
    fi
    
    if ! grep -q "@Builder" "$USER_FILE"; then
        sed -i '/^public class User/i \@Builder' "$USER_FILE"
    fi
    
    if ! grep -q "@NoArgsConstructor" "$USER_FILE"; then
        sed -i '/^public class User/i \@NoArgsConstructor' "$USER_FILE"
    fi
    
    if ! grep -q "@AllArgsConstructor" "$USER_FILE"; then
        sed -i '/^public class User/i \@AllArgsConstructor' "$USER_FILE"
    fi
else
    echo -e "${RED}User.java not found at $USER_FILE${NC}"
fi

# Show instructions to enable Lombok in IDE
echo -e "${GREEN}Lombok setup completed.${NC}"
echo -e "${YELLOW}Make sure your IDE has Lombok support enabled:${NC}"
echo -e "  - For IntelliJ IDEA: Install the Lombok plugin and enable annotation processing"
echo -e "  - For Eclipse: Run the Lombok installer (java -jar $LOMBOK_PATH)"
echo -e "  - For VS Code: Install the Lombok Annotations Support extension"
echo -e ""
echo -e "${YELLOW}To build your project with Lombok, run:${NC}"
echo -e "  mvn clean install"
echo -e ""
echo -e "${YELLOW}You may need to restart your IDE for changes to take effect.${NC}"
