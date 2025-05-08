#!/bin/bash

# Colors for better readability
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Fixing Lombok in Maven pom.xml...${NC}"

if [ ! -f "pom.xml" ]; then
    echo -e "${RED}Error: pom.xml not found in current directory${NC}"
    exit 1
fi

# Create a backup
cp pom.xml pom.xml.bak.$(date +%s)
echo -e "${GREEN}Created backup of pom.xml${NC}"

# Check if Lombok is already in the dependencies
if grep -q "org.projectlombok" pom.xml; then
    echo -e "${YELLOW}Lombok dependency found in pom.xml${NC}"
    
    # Let's ensure it has the correct version and scope
    # First, check if we need to update it
    if ! grep -q "<artifactId>lombok</artifactId>.*<version>1.18.30</version>.*<scope>provided</scope>" pom.xml; then
        echo -e "${YELLOW}Updating Lombok dependency configuration...${NC}"
        
        # Remove the existing lombok dependency
        sed -i '/<groupId>org\.projectlombok<\/groupId>/,/<\/dependency>/d' pom.xml
        
        # Add the lombok dependency with correct configuration
        sed -i '/<dependencies>/a \
        <dependency>\
            <groupId>org.projectlombok<\/groupId>\
            <artifactId>lombok<\/artifactId>\
            <version>1.18.30<\/version>\
            <scope>provided<\/scope>\
        <\/dependency>' pom.xml
        
        echo -e "${GREEN}Updated Lombok dependency${NC}"
    else
        echo -e "${GREEN}Lombok dependency is already correctly configured${NC}"
    fi
else
    # Add lombok dependency
    echo -e "${YELLOW}Adding Lombok dependency to pom.xml...${NC}"
    sed -i '/<dependencies>/a \
        <dependency>\
            <groupId>org.projectlombok<\/groupId>\
            <artifactId>lombok<\/artifactId>\
            <version>1.18.30<\/version>\
            <scope>provided<\/scope>\
        <\/dependency>' pom.xml
    echo -e "${GREEN}Added Lombok dependency${NC}"
fi

# Add Lombok annotation processor to maven-compiler-plugin if not already there
if ! grep -q "lombok-maven-plugin" pom.xml; then
    echo -e "${YELLOW}Adding Lombok Maven plugin to pom.xml...${NC}"
    
    # First check if build plugins section exists
    if ! grep -q "<build>.*<plugins>" pom.xml; then
        echo -e "${YELLOW}Adding plugins section...${NC}"
        sed -i '/<\/dependencies>/a \
    <build>\
        <plugins>\
        </plugins>\
    </build>' pom.xml
    fi
    
    # Now add the Lombok plugin before the closing plugins tag
    sed -i '/<\/plugins>/i \
            <plugin>\
                <groupId>org.projectlombok<\/groupId>\
                <artifactId>lombok-maven-plugin<\/artifactId>\
                <version>1.18.20.0<\/version>\
                <executions>\
                    <execution>\
                        <phase>generate-sources<\/phase>\
                        <goals>\
                            <goal>delombok<\/goal>\
                        <\/goals>\
                    <\/execution>\
                <\/executions>\
            <\/plugin>' pom.xml
    
    echo -e "${GREEN}Added Lombok Maven plugin${NC}"
fi

# Configure maven-compiler-plugin for annotation processing
if grep -q "maven-compiler-plugin" pom.xml; then
    echo -e "${YELLOW}Updating maven-compiler-plugin configuration...${NC}"
    
    # Check if annotation processing is already configured
    if ! grep -q "<annotationProcessorPaths>" pom.xml; then
        # Find the maven-compiler-plugin and add the configuration
        sed -i '/<artifactId>maven-compiler-plugin<\/artifactId>/,/<\/plugin>/ {
            /<configuration>/,/<\/configuration>/ {
                /<\/configuration>/i \
                    <annotationProcessorPaths>\
                        <path>\
                            <groupId>org.projectlombok<\/groupId>\
                            <artifactId>lombok<\/artifactId>\
                            <version>1.18.30<\/version>\
                        <\/path>\
                    <\/annotationProcessorPaths>
            }
        }' pom.xml
        
        echo -e "${GREEN}Updated maven-compiler-plugin with annotation processor paths${NC}"
    else
        echo -e "${GREEN}Annotation processor paths already configured${NC}"
    fi
else
    echo -e "${YELLOW}Adding maven-compiler-plugin with Lombok annotation processor...${NC}"
    
    # Add the maven-compiler-plugin before the closing plugins tag
    sed -i '/<\/plugins>/i \
            <plugin>\
                <groupId>org.apache.maven.plugins<\/groupId>\
                <artifactId>maven-compiler-plugin<\/artifactId>\
                <version>3.11.0<\/version>\
                <configuration>\
                    <source>17<\/source>\
                    <target>17<\/target>\
                    <annotationProcessorPaths>\
                        <path>\
                            <groupId>org.projectlombok<\/groupId>\
                            <artifactId>lombok<\/artifactId>\
                            <version>1.18.30<\/version>\
                        <\/path>\
                    <\/annotationProcessorPaths>\
                <\/configuration>\
            <\/plugin>' pom.xml
    
    echo -e "${GREEN}Added maven-compiler-plugin with annotation processor configuration${NC}"
fi

# Now add lombok config file
echo -e "${YELLOW}Creating lombok.config file...${NC}"
cat > lombok.config << EOL
# Lombok configuration
config.stopBubbling = true
lombok.addLombokGeneratedAnnotation = true
lombok.anyConstructor.addConstructorProperties = true
# Make Lombok create getters for all fields
lombok.accessors.chain = true
EOL
echo -e "${GREEN}Created lombok.config file${NC}"

echo -e "${GREEN}Lombok configuration in pom.xml has been fixed${NC}"
echo -e "${YELLOW}Now you should run:${NC}"
echo -e "  mvn clean install -DskipTests"
echo -e "${YELLOW}This will force Maven to download the Lombok dependency and set up the annotation processor.${NC}"
