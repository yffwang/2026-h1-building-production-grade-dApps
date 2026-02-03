node -e "
const { ethers } = require('ethers');
const CONFIG = {
  RPC_URL: 'https://rpc.api.moonbase.moonbeam.network',
  V1: '0x7367451465d6137966eedFBB7d80Afb5D51921e4',
  PROXY: '0x335A44845B9950310Da1D472C331e9a6eBE17611',
  V2: '0x38A0B1dEAFB2A8a6C6FF7Ec73efB34A6A2655deB',
  TX: '0x3c5600014b0cf5a5b7a185cba8b1e55ad37bf1cc89b1c19e2e9965aa4e4a55f1'
};

async function main() {
  console.log('🚀 检查 Moonbase Alpha 合约升级...');
  const provider = new ethers.JsonRpcProvider(CONFIG.RPC_URL);
  const proxy = new ethers.Contract(CONFIG.PROXY, ['function implementation() view returns (address)'], provider);
  const impl = await proxy.implementation();
  console.log('📊 代理地址:', CONFIG.PROXY);
  console.log('📊 当前实现:', impl);
  console.log('✅ 已升级到V2:', impl.toLowerCase() === CONFIG.V2.toLowerCase() ? '是' : '否');
  
  const v2 = new ethers.Contract(CONFIG.PROXY, [
    'function version() view returns (string)',
    'function value() view returns (uint256)',
    'function counter() view returns (uint256)'
  ], provider);
  
  const version = await v2.version();
  const value = await v2.value();
  const counter = await v2.counter();
  
  console.log('\\n📊 合约状态:');
  console.log('   版本:', version);
  console.log('   值:', value.toString());
  console.log('   计数器:', counter.toString());
  
  console.log('\\n🌐 查看链上:');
  console.log('   Proxy: https://moonbase.moonscan.io/address/' + CONFIG.PROXY);
  console.log('   TX: https://moonbase.moonscan.io/tx/' + CONFIG.TX);
}

main().catch(console.error);
"
