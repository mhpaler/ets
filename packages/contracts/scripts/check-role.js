const { ethers } = require("hardhat");

async function checkRole() {
  const ETSAccessControls = await ethers.getContractAt(
    "ETSAccessControls",
    "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
  );
  const EVENT_PROCESSOR_ROLE = await ETSAccessControls.EVENT_PROCESSOR_ROLE();
  console.log("EVENT_PROCESSOR_ROLE hash:", EVENT_PROCESSOR_ROLE);

  const eventProcessorAddress = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC";
  const hasRole = await ETSAccessControls.hasRole(EVENT_PROCESSOR_ROLE, eventProcessorAddress);

  console.log("Account:", eventProcessorAddress);
  console.log("Has EVENT_PROCESSOR_ROLE:", hasRole);

  if (!hasRole) {
    console.log("Role is missing! This explains the test failure.");
  }
}

checkRole()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
