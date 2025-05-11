#!/bin/bash

# Colors for better readability
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Fixing duplicate methods in User class...${NC}"

USER_FILE="src/main/java/com/attendanceiq/api/models/User.java"

if [ ! -f "$USER_FILE" ]; then
    echo -e "${RED}Error: User.java file not found at $USER_FILE${NC}"
    exit 1
fi

# Create a backup
cp "$USER_FILE" "${USER_FILE}.bak.$(date +%s)"
echo -e "${GREEN}Created backup of User.java${NC}"

# This is a more targeted approach to remove specifically the duplicate methods
# without affecting other parts of the file

# Read the file content
content=$(cat "$USER_FILE")

# Remove the duplicate method blocks that were added by our previous script
# We'll match from @Override to the closing brace of each method
content=$(echo "$content" | sed '/^    @Override\s*$/,/^    public boolean isAccountNonExpired()/d')
content=$(echo "$content" | sed '/^    @Override\s*$/,/^    public boolean isAccountNonLocked()/d')
content=$(echo "$content" | sed '/^    @Override\s*$/,/^    public boolean isCredentialsNonExpired()/d')
content=$(echo "$content" | sed '/^    @Override\s*$/,/^    public boolean isEnabled()/d')
content=$(echo "$content" | sed '/^    @Override\s*$/,/^    public String getPassword()/d')
content=$(echo "$content" | sed '/^    @Override\s*$/,/^    public String getUsername()/d')

# Write the cleaned content back to the file
echo "$content" > "$USER_FILE"

echo -e "${GREEN}Removed duplicate methods from User class${NC}"

# Now make sure all the Lombok annotations are there
if ! grep -q "@Data" "$USER_FILE"; then
    sed -i '1,/^public class User/s/public class User/@Data\npublic class User/' "$USER_FILE"
    echo -e "${GREEN}Added @Data annotation${NC}"
fi

if ! grep -q "@Builder" "$USER_FILE"; then
    sed -i '1,/^public class User/s/public class User/@Builder\npublic class User/' "$USER_FILE"
    echo -e "${GREEN}Added @Builder annotation${NC}"
fi

if ! grep -q "@NoArgsConstructor" "$USER_FILE"; then
    sed -i '1,/^public class User/s/public class User/@NoArgsConstructor\npublic class User/' "$USER_FILE"
    echo -e "${GREEN}Added @NoArgsConstructor annotation${NC}"
fi

if ! grep -q "@AllArgsConstructor" "$USER_FILE"; then
    sed -i '1,/^public class User/s/public class User/@AllArgsConstructor\npublic class User/' "$USER_FILE"
    echo -e "${GREEN}Added @AllArgsConstructor annotation${NC}"
fi

echo -e "${GREEN}User class fixed successfully${NC}"
