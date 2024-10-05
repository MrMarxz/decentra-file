import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const DecentraFileModule = buildModule("DecentraFileModule", (m) => {
  const decentraFile = m.contract("DecentraFile");

  return { decentraFile };
});

export default DecentraFileModule;