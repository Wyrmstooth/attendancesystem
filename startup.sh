#!/bin/bash

# Backend startup script for AttendanceIQ

# Colors for better readability
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting AttendanceIQ Backend...${NC}"

# Make sure we're in the backend directory
cd "$(dirname "$0")"
cd backend 2>/dev/null || {
    # If we can't cd to 'backend', try to see if we're already in it by checking for pom.xml
    if [ ! -f "pom.xml" ]; then
        echo -e "${RED}Error: Could not find the backend directory.${NC}"
        echo -e "${YELLOW}Make sure you're running this script from the project root or backend directory.${NC}"
        exit 1
    fi
}

echo -e "${GREEN}Working directory: $(pwd)${NC}"

# Check if we have a Maven wrapper or Maven installed
if [ -f "./mvnw" ]; then
    MVN_CMD="./mvnw"
    # Make sure the Maven wrapper is executable
    chmod +x ./mvnw
elif command -v mvn >/dev/null 2>&1; then
    MVN_CMD="mvn"
else
    echo -e "${RED}Error: Maven is not installed and Maven wrapper was not found.${NC}"
    echo -e "${YELLOW}Please install Maven or make sure the Maven wrapper (mvnw) is in the backend directory.${NC}"
    exit 1
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
jwt.expiration=86400000

# Server configuration
server.port=8080

# Enable the data initializer (only for dev profile)
spring.profiles.active=dev
EOF
    echo -e "${GREEN}Default application.properties created.${NC}"
    echo -e "${YELLOW}Please edit the file with your database credentials if needed.${NC}"
fi

# Check if MySQL is running
echo -e "${GREEN}Checking MySQL connection...${NC}"
if command -v mysql >/dev/null 2>&1; then
    # Extract username and password from application.properties
    DB_USER=$(grep "spring.datasource.username" src/main/resources/application.properties | cut -d'=' -f2)
    DB_PASS=$(grep "spring.datasource.password" src/main/resources/application.properties | cut -d'=' -f2)
    
    # Try to connect to MySQL
    mysql -u"$DB_USER" -p"$DB_PASS" -e "SELECT 1" >/dev/null 2>&1
    if [ $? -ne 0 ]; then
        echo -e "${YELLOW}Warning: Could not connect to MySQL with the credentials in application.properties.${NC}"
        echo -e "${YELLOW}Make sure MySQL is running and the credentials are correct.${NC}"
        echo -e "${YELLOW}The application might fail to start if the database connection fails.${NC}"
    else
        echo -e "${GREEN}MySQL connection successful.${NC}"
    fi
else
    echo -e "${YELLOW}Warning: MySQL client not found. Cannot verify database connection.${NC}"
    echo -e "${YELLOW}Make sure your MySQL server is running.${NC}"
fi

# Build the project
echo -e "${GREEN}Building the project...${NC}"
$MVN_CMD clean package -DskipTests

# Check if build was successful
if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Build failed. Please check the logs above.${NC}"
    exit 1
fi

echo -e "${GREEN}Build successful!${NC}"

# Run the application
echo -e "${GREEN}Starting the Spring Boot application...${NC}"
echo -e "${YELLOW}The application will be available at http://localhost:8080${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}"

$MVN_CMD spring-boot:run

# This point is reached only if the application exits
echo -e "${GREEN}Backend server stopped.${NC}"