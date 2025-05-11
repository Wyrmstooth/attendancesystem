#!/bin/bash

# Colors for better readability
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting AttendanceIQ Backend...${NC}"

# Make sure we're in the backend directory
cd "$(dirname "$0")"

echo -e "${GREEN}Working directory: $(pwd)${NC}"

# First, let's fix the directory structure if needed
if [ -f "./src/main/resources/pom.xml" ]; then
    echo -e "${YELLOW}Found pom.xml in resources directory. Moving to correct location...${NC}"
    mv ./src/main/resources/pom.xml ./pom.xml
fi

# Check if we have source files in the right place
if [ ! -d "./src/main/java/com/attendanceiq/api" ]; then
    echo -e "${YELLOW}Creating proper directory structure...${NC}"
    mkdir -p ./src/main/java/com/attendanceiq/api
    
    # If Java files exist in wrong location, move them
    if [ -d "./src/main/java" ]; then
        find ./src/main/java -name "*.java" -exec cp {} ./src/main/java/com/attendanceiq/api/ \;
    fi
fi

# Create application.properties if it doesn't exist
if [ ! -f "src/main/resources/application.properties" ]; then
    echo -e "${YELLOW}application.properties not found, creating default configuration...${NC}"
    mkdir -p src/main/resources
    cat > src/main/resources/application.properties << EOF
# Database configuration
spring.datasource.url=jdbc:mysql://localhost:3306/attendance_iq?createDatabaseIfNotExist=true
spring.datasource.username=root
spring.datasource.password=password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA/Hibernate configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true

# JWT Configuration
jwt.secret=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
# Token validity period in milliseconds (24 hours)
jwt.expiration=86400000

# Server configuration
server.port=8080

# Enable the data initializer (only for dev profile)
spring.profiles.active=dev

# Debug admin registration
debug=true
logging.level.com.attendanceiq.api.controllers.AuthController=DEBUG
logging.level.com.attendanceiq.api.services.AuthService=DEBUG
EOF
    echo -e "${GREEN}Default application.properties created.${NC}"
fi

# Check if MySQL is available
echo -e "${YELLOW}Testing MySQL connection...${NC}"
if command -v mysql >/dev/null 2>&1; then
    if mysql -u root -ppassword -e ";" 2>/dev/null; then
        echo -e "${GREEN}MySQL connection successful!${NC}"
    else
        echo -e "${YELLOW}Could not connect to MySQL with default credentials.${NC}"
        echo -e "${YELLOW}You may need to update the database password in application.properties${NC}"
    fi
else
    echo -e "${YELLOW}MySQL client not found. Make sure MySQL is installed and running.${NC}"
fi

# Update the AttendanceIqApplication.java if it doesn't exist or is in the wrong place
if [ ! -f "src/main/java/com/attendanceiq/api/AttendanceIqApplication.java" ]; then
    echo -e "${YELLOW}Creating main application class...${NC}"
    cat > src/main/java/com/attendanceiq/api/AttendanceIqApplication.java << EOF
package com.attendanceiq.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class AttendanceIqApplication {
    public static void main(String[] args) {
        SpringApplication.run(AttendanceIqApplication.class, args);
    }
}
EOF
fi

# Check if Maven is installed
if command -v mvn >/dev/null 2>&1; then
    MVN_CMD="mvn"
else
    echo -e "${RED}Error: Maven is not installed.${NC}"
    echo -e "${YELLOW}Please install Maven and try again.${NC}"
    exit 1
fi

echo -e "${GREEN}Building and running the project...${NC}"
echo -e "${YELLOW}The application will be available at http://localhost:8080${NC}"
echo -e "${GREEN}-------------------------------------------------------${NC}"
echo -e "${GREEN}Default admin credentials:${NC}"
echo -e "${GREEN}Email: admin@example.com${NC}"
echo -e "${GREEN}Password: Admin123!${NC}"
echo -e "${GREEN}-------------------------------------------------------${NC}"

# Build and run the application using Spring Boot Maven plugin with debug output
$MVN_CMD clean spring-boot:run -Dspring-boot.run.jvmArguments="-Ddebug"

echo -e "${GREEN}Backend server stopped.${NC}"