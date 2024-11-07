import fs from "fs";

const FILE_PATH = "./src/activeGroups.json";

export let activeGroupIds = new Map<number, string>();

// Load group IDs and titles from file
export function loadGroupIds() {
  if (fs.existsSync(FILE_PATH)) {
    const data = JSON.parse(fs.readFileSync(FILE_PATH, "utf8"));
    activeGroupIds = new Map(data);
    console.log("Loaded group IDs and names from file:", activeGroupIds);
  }
}

// Save group IDs and titles to file
export function saveGroupIds() {
  const groupArray = Array.from(activeGroupIds.entries());
  fs.writeFileSync(FILE_PATH, JSON.stringify(groupArray), "utf8");
}
