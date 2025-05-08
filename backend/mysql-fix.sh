#!/bin/bash

# Colors for better readability
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}MySQL Connection Fix Script${NC}"

# Update the application.properties file with configurable credentials
update_application_properties() {
    local username=$1
    local password=$2
    
    echo -e "${YELLOW}Updating application.properties with your database credentials...${NC}"
    
    if [ -f "src/main/resources/application.properties" ]; then
        # Back up the original file
        cp src/main/resources/application.properties src/main/resources/application.properties.bak
        
        # Update the username and password in the file
        sed -i "s/spring.datasource.username=.*/spring.datasource.username=$username/" src/main/resources/application.properties
        sed -i "s/spring.datasource.password=.*/spring.datasource.password=$password/" src/main/resources/application.properties
        
        echo -e "${GREEN}Updated database credentials in application.properties${NC}"
        echo -e "${GREEN}Original file backed up to application.properties.bak${NC}"
    else
        echo -e "${RED}application.properties file not found!${NC}"
        return 1
    fi
}

# Check if MySQL is running
echo -e "${YELLOW}Checking if MySQL service is running...${NC}"
if systemctl is-active --quiet mysql; then
    echo -e "${GREEN}MySQL service is running.${NC}"
else
    echo -e "${RED}MySQL service is not running.${NC}"
    echo -e "${YELLOW}Attempting to start MySQL service...${NC}"
    sudo systemctl start mysql
    
    if systemctl is-active --quiet mysql; then
        echo -e "${GREEN}MySQL service started successfully.${NC}"
    else
        echo -e "${RED}Failed to start MySQL service. Please start it manually.${NC}"
        echo -e "${YELLOW}You can try: sudo systemctl start mysql${NC}"
        exit 1
    fi
fi

# Prompt for MySQL credentials
echo -e "${YELLOW}Please enter your MySQL credentials:${NC}"
read -p "Username (default is root): " mysql_user
mysql_user=${mysql_user:-root}

# Securely read password (hidden input)
read -s -p "Password: " mysql_password
echo ""

# Test MySQL connection
echo -e "${YELLOW}Testing MySQL connection...${NC}"
if mysql -u "$mysql_user" -p"$mysql_password" -e "SELECT 1" > /dev/null 2>&1; then
    echo -e "${GREEN}MySQL connection successful!${NC}"
    
    # Check if the database exists
    echo -e "${YELLOW}Checking if database 'attendance_iq' exists...${NC}"
    if ! mysql -u "$mysql_user" -p"$mysql_password" -e "USE attendance_iq" > /dev/null 2>&1; then
        echo -e "${YELLOW}Database 'attendance_iq' doesn't exist. Creating it...${NC}"
        mysql -u "$mysql_user" -p"$mysql_password" -e "CREATE DATABASE attendance_iq" > /dev/null 2>&1
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}Database 'attendance_iq' created successfully.${NC}"
        else
            echo -e "${RED}Failed to create database. Please create it manually.${NC}"
            echo -e "${YELLOW}You can try: mysql -u $mysql_user -p -e 'CREATE DATABASE attendance_iq'${NC}"
        fi
    else
        echo -e "${GREEN}Database 'attendance_iq' already exists.${NC}"
    fi
    
    # Update application.properties with working credentials
    update_application_properties "$mysql_user" "$mysql_password"
else
    echo -e "${RED}MySQL connection failed with these credentials.${NC}"
    echo -e "${YELLOW}Please verify your MySQL installation and credentials.${NC}"
    echo -e "${YELLOW}You might need to reset your MySQL root password or create a new user.${NC}"
    
    # Offer to help reset MySQL root password
    read -p "Would you like assistance resetting the MySQL root password? (y/n): " reset_password
    if [[ $reset_password == "y" || $reset_password == "Y" ]]; then
        echo -e "${YELLOW}Here's a guide to reset your MySQL root password:${NC}"
        echo -e "1. Stop the MySQL service: ${GREEN}sudo systemctl stop mysql${NC}"
        echo -e "2. Start MySQL in safe mode: ${GREEN}sudo mysqld_safe --skip-grant-tables --skip-networking &${NC}"
        echo -e "3. Connect to MySQL: ${GREEN}mysql -u root${NC}"
        echo -e "4. Run the following commands:"
        echo -e "   ${GREEN}mysql> USE mysql;${NC}"
        echo -e "   ${GREEN}mysql> UPDATE user SET authentication_string=PASSWORD('new_password') WHERE User='root';${NC}"
        echo -e "   ${GREEN}mysql> FLUSH PRIVILEGES;${NC}"
        echo -e "   ${GREEN}mysql> exit;${NC}"
        echo -e "5. Restart MySQL normally: ${GREEN}sudo systemctl restart mysql${NC}"
        echo -e "6. Try connecting with your new password"
    fi
    
    echo -e "${YELLOW}Alternatively, you can try creating a new MySQL user with full privileges:${NC}"
    echo -e "1. Log into MySQL as root or any admin user"
    echo -e "2. Run: ${GREEN}CREATE USER 'attendanceuser'@'localhost' IDENTIFIED BY 'password';${NC}"
    echo -e "3. Run: ${GREEN}GRANT ALL PRIVILEGES ON attendance_iq.* TO 'attendanceuser'@'localhost';${NC}"
    echo -e "4. Run: ${GREEN}FLUSH PRIVILEGES;${NC}"
    echo -e "5. Then update your application.properties with these new credentials"
    
    exit 1
fi

echo -e "${GREEN}Database configuration completed successfully.${NC}"
echo -e "${YELLOW}You can now try running your Spring Boot application again.${NC}"
