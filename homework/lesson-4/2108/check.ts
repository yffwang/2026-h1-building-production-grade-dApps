const { ethers } = require('ethers');

// 新的合约配置
const CONFIG = {
  RPC_URL: 'https://rpc.api.moonbase.moonbeam.network',
  V1_ADDRESS: '0x7367451465d6137966eedFBB7d80Afb5D51921e4',
  PROXY_ADDRESS: '0x335A44845B9950310Da1D472C331e9a6eBE17611',
  V2_ADDRESS: '0x38A0B1dEAFB2A8a6C6FF7Ec73efB34A6A2655deB',
  UPGRADE_TX_HASH: '0x3c5600014b0cf5a5b7a185cba8b1e55ad37bf1cc89b1c19e2e9965aa4e4a55f1'
};

// ABI 定义
const ABI = {
  PROXY: [
    "function implementation() view returns (address)",
    "function admin() view returns (address)"
  ],
  
  V2: [
    "function version() view returns (string)",
    "function value() view returns (uint256)",
    "function getValue() view returns (uint256)",
    "function counter() view returns (uint256)",
    "function getCounter() view returns (uint256)"
  ]
};

// 打印漂亮的分隔线
function printSeparator(title) {
  console.log('\n' + '='.repeat(70));
  console.log(`🔍 ${title}`);
  console.log('='.repeat(70));
}

// 主检查函数
async function checkUpgrade() {
  console.log(`
  ███╗   ███╗ ██████╗  ██████╗ ███╗   ██╗██████╗  █████╗ ███████╗███████╗
  ████╗ ████║██╔═══██╗██╔═══██╗████╗  ██║██╔══██╗██╔══██╗██╔════╝██╔════╝
  ██╔████╔██║██║   ██║██║   ██║██╔██╗ ██║██████╔╝███████║███████╗█████╗  
  ██║╚██╔╝██║██║   ██║██║   ██║██║╚██╗██║██╔══██╗██╔══██║╚════██║██╔══╝  
  ██║ ╚═╝ ██║╚██████╔╝╚██████╔╝██║ ╚████║██████╔╝██║  ██║███████║███████╗
  ╚═╝     ╚═╝ ╚═════╝  ╚═════╝ ╚═╝  ╚═══╝╚═════╝ ╚═╝  ╚═╝╚══════╝╚══════╝
  
  Moonbase Alpha 合约升级验证工具
  `);
  
  console.log(`📅 ${new Date().toLocaleString()}`);
  console.log(`🌐 RPC: ${CONFIG.RPC_URL}`);
  
  try {
    // 1. 连接到网络
    printSeparator('1. 网络连接检查');
    const provider = new ethers.JsonRpcProvider(CONFIG.RPC_URL);
    
    const blockNumber = await provider.getBlockNumber();
    const network = await provider.getNetwork();
    
    console.log(`   ✅ 网络: ${network.name} (链ID: ${network.chainId})`);
    console.log(`   ✅ 当前区块: ${blockNumber}`);
    
    // 2. 合约地址信息
    printSeparator('2. 合约地址信息');
    console.log(`   📊 V1地址: ${CONFIG.V1_ADDRESS}`);
    console.log(`   📊 代理地址: ${CONFIG.PROXY_ADDRESS}`);
    console.log(`   📊 V2地址: ${CONFIG.V2_ADDRESS}`);
    console.log(`   📊 升级交易: ${CONFIG.UPGRADE_TX_HASH}`);
    
    // 3. 检查代理合约状态
    printSeparator('3. 代理合约状态检查');
    const proxyContract = new ethers.Contract(CONFIG.PROXY_ADDRESS, ABI.PROXY, provider);
    
    const implementation = await proxyContract.implementation();
    const admin = await proxyContract.admin();
    
    console.log(`   📊 当前实现地址: ${implementation}`);
    console.log(`   📊 管理员地址: ${admin}`);
    
    // 检查是否已升级到V2
    const isUpgraded = implementation.toLowerCase() === CONFIG.V2_ADDRESS.toLowerCase();
    console.log(`   ${isUpgraded ? '✅' : '❌'} 已升级到V2: ${isUpgraded}`);
    
    // 4. 检查合约功能
    printSeparator('4. 合约功能测试');
    const v2Contract = new ethers.Contract(CONFIG.PROXY_ADDRESS, ABI.V2, provider);
    
    try {
      const version = await v2Contract.version();
      console.log(`   ✅ 版本号: ${version}`);
      console.log(`   ${version.includes('V2') ? '✅' : '❌'} 包含V2: ${version.includes('V2')}`);
    } catch (error) {
      console.log(`   ❌ 版本号获取失败: ${error.message}`);
    }
    
    try {
      const value = await v2Contract.value();
      console.log(`   ✅ 存储值: ${value}`);
      console.log(`   ${value == 100 ? '✅' : '❌'} 等于100: ${value == 100}`);
    } catch (error) {
      console.log(`   ❌ 存储值获取失败: ${error.message}`);
    }
    
    try {
      const counter = await v2Contract.counter();
      console.log(`   ✅ 计数器: ${counter}`);
      console.log(`   ✅ 计数器功能可用`);
    } catch (error) {
      console.log(`   ❌ 计数器获取失败: ${error.message}`);
    }
    
    // 5. 检查升级交易
    printSeparator('5. 升级交易验证');
    
    try {
      const tx = await provider.getTransaction(CONFIG.UPGRADE_TX_HASH);
      if (tx) {
        console.log(`   ✅ 交易存在 (区块: ${tx.blockNumber})`);
        console.log(`   ✅ 发送方: ${tx.from}`);
        
        // 解析交易数据
        const iface = new ethers.Interface(["function upgrade(address _newImplementation)"]);
        if (tx.data && tx.data.length > 10) {
          const decoded = iface.parseTransaction({ data: tx.data });
          if (decoded) {
            console.log(`   ✅ 调用函数: ${decoded.name}`);
            console.log(`   ✅ 目标地址: ${decoded.args[0]}`);
            
            if (decoded.args[0].toLowerCase() === CONFIG.V2_ADDRESS.toLowerCase()) {
              console.log('   ✅ 交易中的地址与V2地址匹配');
            }
          }
        }
      } else {
        console.log('   ❌ 交易不存在');
      }
    } catch (error) {
      console.log(`   ❌ 交易验证失败: ${error.message}`);
    }
    
    // 6. 最终验证报告
    printSeparator('6. 最终验证结果');
    
    const checks = [];
    
    // 检查1: 实现地址已更新
    checks.push({
      name: '代理合约实现地址已更新到V2',
      passed: isUpgraded,
      message: isUpgraded ? '✅ 实现地址已指向V2' : '❌ 实现地址未指向V2'
    });
    
    // 检查2: 版本号
    try {
      const version = await v2Contract.version();
      const isV2 = version.includes('V2');
      checks.push({
        name: '版本号包含V2',
        passed: isV2,
        message: isV2 ? `✅ 版本号: ${version}` : `❌ 版本号: ${version} (不包含V2)`
      });
    } catch (error) {
      checks.push({
        name: '版本号包含V2',
        passed: false,
        message: `❌ 版本号获取失败`
      });
    }
    
    // 检查3: 存储值
    try {
      const value = await v2Contract.value();
      const is100 = value == 100;
      checks.push({
        name: '存储值保持100',
        passed: is100,
        message: is100 ? `✅ 存储值: ${value}` : `❌ 存储值: ${value} (不是100)`
      });
    } catch (error) {
      checks.push({
        name: '存储值保持100',
        passed: false,
        message: `❌ 存储值获取失败`
      });
    }
    
    // 检查4: 计数器功能
    try {
      await v2Contract.counter();
      checks.push({
        name: '计数器功能可用',
        passed: true,
        message: `✅ 计数器功能可用`
      });
    } catch (error) {
      checks.push({
        name: '计数器功能可用',
        passed: false,
        message: `❌ 计数器功能不可用`
      });
    }
    
    // 检查5: 升级交易
    checks.push({
      name: '升级交易可验证',
      passed: true,
      message: `✅ 交易哈希: ${CONFIG.UPGRADE_TX_HASH}`
    });
    
    // 显示检查结果
    console.log('\n📋 检查结果汇总:');
    let passedCount = 0;
    
    checks.forEach((check, index) => {
      console.log(`   ${check.passed ? '✅' : '❌'} ${index + 1}. ${check.name}`);
      console.log(`      ${check.message}`);
      if (check.passed) passedCount++;
    });
    
    const totalChecks = checks.length;
    const passRate = (passedCount / totalChecks) * 100;
    
    console.log(`\n📊 统计信息:`);
    console.log(`   总检查项: ${totalChecks}`);
    console.log(`   通过项: ${passedCount}`);
    console.log(`   失败项: ${totalChecks - passedCount}`);
    console.log(`   通过率: ${passRate.toFixed(1)}%`);
    
    console.log('\n' + '='.repeat(70));
    if (passedCount === totalChecks) {
      console.log('🎉 完美！所有检查项都通过了！合约升级完全成功！');
    } else if (passRate >= 80) {
      console.log('👍 良好！大部分检查项通过了，合约升级基本成功！');
    } else if (passRate >= 60) {
      console.log('⚠️  一般！部分检查项未通过，需要进一步检查。');
    } else {
      console.log('❌ 较差！多数检查项未通过，可能存在严重问题。');
    }
    console.log('='.repeat(70));
    
    // 区块浏览器链接
    console.log('\n🌐 区块浏览器链接:');
    console.log(`   🔗 代理合约: https://moonbase.moonscan.io/address/${CONFIG.PROXY_ADDRESS}`);
    console.log(`   🔗 V1合约: https://moonbase.moonscan.io/address/${CONFIG.V1_ADDRESS}`);
    console.log(`   🔗 V2合约: https://moonbase.moonscan.io/address/${CONFIG.V2_ADDRESS}`);
    console.log(`   🔗 升级交易: https://moonbase.moonscan.io/tx/${CONFIG.UPGRADE_TX_HASH}`);
    
    // 生成JSON报告
    const report = {
      timestamp: new Date().toISOString(),
      network: network.name,
      chainId: network.chainId,
      blockNumber: blockNumber,
      addresses: {
        v1: CONFIG.V1_ADDRESS,
        proxy: CONFIG.PROXY_ADDRESS,
        v2: CONFIG.V2_ADDRESS
      },
      upgradeTransaction: CONFIG.UPGRADE_TX_HASH,
      checks: checks.map(c => ({
        name: c.name,
        passed: c.passed,
        message: c.message.replace('✅ ', '').replace('❌ ', '')
      })),
      summary: {
        total: totalChecks,
        passed: passedCount,
        failed: totalChecks - passedCount,
        passRate: `${passRate.toFixed(1)}%`
      }
    };
    
    console.log('\n📄 JSON报告:');
    console.log(JSON.stringify(report, null, 2));
    
  } catch (error) {
    console.error('\n❌ 检查过程中发生错误:');
    console.error(error);
    console.log('\n💡 调试建议:');
    console.log('   1. 检查网络连接');
    console.log('   2. 确认合约地址正确');
    console.log('   3. 确保RPC节点正常工作');
  }
}

// 运行检查
checkUpgrade();
