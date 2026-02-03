"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
// 新的合约配置
const CONFIG = {
    RPC_URL: 'https://rpc.api.moonbase.moonbeam.network',
    V1_ADDRESS: '0x7367451465d6137966eedFBB7d80Afb5D51921e4',
    PROXY_ADDRESS: '0x335A44845B9950310Da1D472C331e9a6eBE17611',
    V2_ADDRESS: '0x38A0B1dEAFB2A8a6C6FF7Ec73efB34A6A2655deB',
    UPGRADE_TX_HASH: '0x3c5600014b0cf5a5b7a185cba8b1e55ad37bf1cc89b1c19e2e9965aa4e4a55f1'
};
// 完整 ABI 定义
const ABI = {
    PROXY: [
        "function implementation() view returns (address)",
        "function admin() view returns (address)",
        "function upgrade(address _newImplementation) external"
    ],
    V1: [
        "function version() view returns (string)",
        "function value() view returns (uint256)",
        "function getValue() view returns (uint256)",
        "function setValue(uint256 newValue) external",
        "function increment() external"
    ],
    V2: [
        "function version() view returns (string)",
        "function value() view returns (uint256)",
        "function getValue() view returns (uint256)",
        "function counter() view returns (uint256)",
        "function getCounter() view returns (uint256)",
        "function setValue(uint256 newValue) external",
        "function increment() external"
    ]
};
// 彩色输出辅助函数
class Logger {
    static section(title) {
        console.log('\n' + '='.repeat(70));
        console.log(`🎯 ${title}`);
        console.log('='.repeat(70));
    }
    static success(message) {
        console.log(`   ✅ ${message}`);
    }
    static error(message) {
        console.log(`   ❌ ${message}`);
    }
    static info(message) {
        console.log(`   ℹ️  ${message}`);
    }
    static warning(message) {
        console.log(`   ⚠️  ${message}`);
    }
    static data(label, value) {
        console.log(`   📊 ${label}: ${value}`);
    }
    static link(label, url) {
        console.log(`   🔗 ${label}: ${url}`);
    }
}
// 主检查类
class UpgradeChecker {
    constructor() {
        this.provider = new ethers_1.JsonRpcProvider(CONFIG.RPC_URL);
        this.proxyContract = new ethers_1.Contract(CONFIG.PROXY_ADDRESS, ABI.PROXY, this.provider);
        this.v2Contract = new ethers_1.Contract(CONFIG.PROXY_ADDRESS, ABI.V2, this.provider);
    }
    async checkAll() {
        console.log('🚀 Moonbase Alpha 合约升级验证器');
        console.log(`📅 ${new Date().toLocaleString()}`);
        console.log(`🌐 RPC: ${CONFIG.RPC_URL}`);
        try {
            // 1. 网络连接检查
            await this.checkNetwork();
            // 2. 合约地址验证
            await this.checkAddresses();
            // 3. 代理合约状态
            await this.checkProxyStatus();
            // 4. 合约功能测试
            await this.checkContractFunctions();
            // 5. 存储验证
            await this.checkStorage();
            // 6. 交易验证
            await this.checkTransactions();
            // 7. 生成最终报告
            await this.generateReport();
        }
        catch (error) {
            Logger.error(`检查过程出错: ${error.message}`);
            console.error('详细错误:', error);
        }
    }
    async checkNetwork() {
        Logger.section('1. 网络连接检查');
        try {
            const blockNumber = await this.provider.getBlockNumber();
            const network = await this.provider.getNetwork();
            const feeData = await this.provider.getFeeData();
            Logger.success(`网络: ${network.name} (链ID: ${network.chainId})`);
            Logger.success(`当前区块: ${blockNumber}`);
            Logger.data('最新Gas价格', `${ethers_1.ethers.formatUnits(feeData.gasPrice || 0n, 'gwei')} Gwei`);
            Logger.data('基础费用', `${ethers_1.ethers.formatUnits(feeData.maxFeePerGas || 0n, 'gwei')} Gwei`);
        }
        catch (error) {
            Logger.error(`网络连接失败: ${error.message}`);
            throw error;
        }
    }
    async checkAddresses() {
        Logger.section('2. 合约地址验证');
        Logger.data('V1实现地址', CONFIG.V1_ADDRESS);
        Logger.data('代理合约地址', CONFIG.PROXY_ADDRESS);
        Logger.data('V2实现地址', CONFIG.V2_ADDRESS);
        Logger.data('升级交易哈希', CONFIG.UPGRADE_TX_HASH);
        // 检查合约代码是否存在
        try {
            const proxyCode = await this.provider.getCode(CONFIG.PROXY_ADDRESS);
            const v1Code = await this.provider.getCode(CONFIG.V1_ADDRESS);
            const v2Code = await this.provider.getCode(CONFIG.V2_ADDRESS);
            if (proxyCode !== '0x') {
                Logger.success(`代理合约代码存在 (${proxyCode.length} 字节)`);
            }
            else {
                Logger.error('代理合约代码为空');
            }
            if (v1Code !== '0x') {
                Logger.success(`V1合约代码存在 (${v1Code.length} 字节)`);
            }
            else {
                Logger.error('V1合约代码为空');
            }
            if (v2Code !== '0x') {
                Logger.success(`V2合约代码存在 (${v2Code.length} 字节)`);
            }
            else {
                Logger.error('V2合约代码为空');
            }
            // 比较代码大小
            if (v2Code.length > v1Code.length) {
                Logger.success('V2代码比V1大，符合预期（新增功能）');
            }
            else if (v2Code.length === v1Code.length) {
                Logger.warning('V2和V1代码大小相同');
            }
            else {
                Logger.error('V2代码比V1小，异常情况');
            }
        }
        catch (error) {
            Logger.error(`代码检查失败: ${error.message}`);
        }
    }
    async checkProxyStatus() {
        Logger.section('3. 代理合约状态检查');
        try {
            const implementation = await this.proxyContract.implementation();
            const admin = await this.proxyContract.admin();
            Logger.data('当前实现地址', implementation);
            Logger.data('管理员地址', admin);
            // 验证实现地址
            if (implementation.toLowerCase() === CONFIG.V2_ADDRESS.toLowerCase()) {
                Logger.success('✅ 代理已正确指向V2实现地址');
            }
            else if (implementation.toLowerCase() === CONFIG.V1_ADDRESS.toLowerCase()) {
                Logger.error('代理仍指向V1实现地址');
            }
            else {
                Logger.error(`代理指向未知地址: ${implementation}`);
            }
            // 检查管理员权限
            const network = await this.provider.getNetwork();
            if (admin !== ethers_1.ethers.ZeroAddress) {
                Logger.success('管理员已设置');
            }
            else {
                Logger.error('管理员地址为零地址');
            }
        }
        catch (error) {
            Logger.error(`代理状态检查失败: ${error.message}`);
        }
    }
    async checkContractFunctions() {
        Logger.section('4. 合约功能测试');
        const tests = [
            { name: '版本号', func: () => this.v2Contract.version() },
            { name: '存储值 (value)', func: () => this.v2Contract.value() },
            { name: '存储值 (getValue)', func: () => this.v2Contract.getValue() },
            { name: '计数器 (counter)', func: () => this.v2Contract.counter() },
            { name: '计数器 (getCounter)', func: () => this.v2Contract.getCounter() }
        ];
        for (const test of tests) {
            try {
                const result = await test.func();
                Logger.success(`${test.name}: ${result.toString()}`);
            }
            catch (error) {
                if (test.name.includes('计数器')) {
                    Logger.error(`${test.name}: 函数不存在 (可能是V1版本)`);
                }
                else {
                    Logger.error(`${test.name}: 调用失败 - ${error.message}`);
                }
            }
        }
        // 验证一致性
        try {
            const value1 = await this.v2Contract.value();
            const value2 = await this.v2Contract.getValue();
            if (value1.toString() === value2.toString()) {
                Logger.success('✅ value() 和 getValue() 返回值一致');
            }
            else {
                Logger.error(`❌ value() 和 getValue() 返回值不一致: ${value1} vs ${value2}`);
            }
        }
        catch (error) {
            // 忽略错误
        }
    }
    async checkStorage() {
        Logger.section('5. 存储状态验证');
        try {
            // 读取关键存储槽
            const slots = [
                { index: 0, name: 'value' },
                { index: 1, name: 'version指针' },
                { index: 2, name: 'counter' }
            ];
            for (const slot of slots) {
                try {
                    const storageValue = await this.provider.getStorage(CONFIG.PROXY_ADDRESS, slot.index);
                    const value = ethers_1.ethers.toBigInt(storageValue);
                    if (slot.index === 0) {
                        Logger.data(`Slot ${slot.index} (${slot.name})`, value.toString());
                    }
                    else if (slot.index === 2) {
                        Logger.data(`Slot ${slot.index} (${slot.name})`, value.toString());
                    }
                    else {
                        Logger.data(`Slot ${slot.index} (${slot.name})`, storageValue);
                    }
                    // 验证存储值是否合理
                    if (slot.index === 0 && value > 0) {
                        Logger.success('存储值非零，可能已初始化');
                    }
                }
                catch (error) {
                    Logger.warning(`Slot ${slot.index} 读取失败: ${error.message}`);
                }
            }
            // 验证存储与合约调用的一致性
            try {
                const contractValue = await this.v2Contract.value();
                const storageValue = await this.provider.getStorage(CONFIG.PROXY_ADDRESS, 0);
                if (ethers_1.ethers.toBigInt(storageValue).toString() === contractValue.toString()) {
                    Logger.success('✅ 存储槽0与合约返回值一致');
                }
                else {
                    Logger.error(`❌ 存储槽0 (${ethers_1.ethers.toBigInt(storageValue)}) 与合约返回值 (${contractValue}) 不一致`);
                }
            }
            catch (error) {
                // 忽略错误
            }
        }
        catch (error) {
            Logger.error(`存储检查失败: ${error.message}`);
        }
    }
    async checkTransactions() {
        Logger.section('6. 交易验证');
        // 检查升级交易
        try {
            const tx = await this.provider.getTransaction(CONFIG.UPGRADE_TX_HASH);
            if (tx) {
                Logger.success(`升级交易存在 (区块: ${tx.blockNumber})`);
                Logger.data('发送方', tx.from);
                Logger.data('接收方', tx.to || '未知');
                Logger.data('交易哈希', tx.hash);
                // 解析交易数据
                if (tx.data && tx.data.length > 10) {
                    const iface = new ethers_1.Interface(["function upgrade(address _newImplementation)"]);
                    try {
                        const decoded = iface.parseTransaction({ data: tx.data });
                        if (decoded) {
                            Logger.success(`调用函数: ${decoded.name}`);
                            Logger.data('目标地址', decoded.args[0]);
                            if (decoded.args[0].toLowerCase() === CONFIG.V2_ADDRESS.toLowerCase()) {
                                Logger.success('✅ 交易中的地址与V2地址匹配');
                            }
                            else {
                                Logger.error('❌ 交易中的地址与V2地址不匹配');
                            }
                        }
                    }
                    catch (parseError) {
                        Logger.warning(`交易数据解析失败: ${parseError.message}`);
                    }
                }
                // 获取交易收据
                try {
                    const receipt = await this.provider.getTransactionReceipt(CONFIG.UPGRADE_TX_HASH);
                    if (receipt) {
                        Logger.success(`交易状态: ${receipt.status === 1 ? '成功' : '失败'}`);
                        Logger.data('Gas使用量', receipt.gasUsed.toString());
                        Logger.data('Gas价格', ethers_1.ethers.formatUnits(tx.gasPrice || 0n, 'gwei') + ' Gwei');
                        if (receipt.logs.length > 0) {
                            Logger.data('事件日志数量', receipt.logs.length.toString());
                        }
                    }
                }
                catch (receiptError) {
                    Logger.warning(`交易收据获取失败: ${receiptError.message}`);
                }
            }
            else {
                Logger.error('升级交易不存在');
            }
        }
        catch (error) {
            Logger.error(`交易验证失败: ${error.message}`);
        }
    }
    async generateReport() {
        Logger.section('7. 最终验证报告');
        // 收集所有检查点
        const checkPoints = [];
        try {
            // 检查点1: 实现地址已更新
            const implementation = await this.proxyContract.implementation();
            const isUpgraded = implementation.toLowerCase() === CONFIG.V2_ADDRESS.toLowerCase();
            checkPoints.push({
                name: '代理合约实现地址已更新到V2',
                passed: isUpgraded,
                message: isUpgraded ? '✅ 实现地址已指向V2' : '❌ 实现地址未指向V2'
            });
            // 检查点2: 版本号
            try {
                const version = await this.v2Contract.version();
                const isV2 = version.includes('V2');
                checkPoints.push({
                    name: '版本号包含V2',
                    passed: isV2,
                    message: isV2 ? `✅ 版本号: ${version}` : `❌ 版本号: ${version} (不包含V2)`
                });
            }
            catch (error) {
                checkPoints.push({
                    name: '版本号包含V2',
                    passed: false,
                    message: `❌ 版本号获取失败: ${error.message}`
                });
            }
            // 检查点3: 存储值
            try {
                const value = await this.v2Contract.value();
                const is100 = value.toString() === '100';
                checkPoints.push({
                    name: '存储值保持100',
                    passed: is100,
                    message: is100 ? `✅ 存储值: ${value}` : `❌ 存储值: ${value} (不是100)`
                });
            }
            catch (error) {
                checkPoints.push({
                    name: '存储值保持100',
                    passed: false,
                    message: `❌ 存储值获取失败: ${error.message}`
                });
            }
            // 检查点4: 计数器功能
            try {
                const counter = await this.v2Contract.counter();
                const counterExists = true;
                checkPoints.push({
                    name: '计数器功能可用',
                    passed: counterExists,
                    message: counterExists ? `✅ 计数器值: ${counter}` : '❌ 计数器不可用'
                });
            }
            catch (error) {
                checkPoints.push({
                    name: '计数器功能可用',
                    passed: false,
                    message: '❌ 计数器功能不可用'
                });
            }
            // 检查点5: 升级交易
            try {
                const tx = await this.provider.getTransaction(CONFIG.UPGRADE_TX_HASH);
                const txExists = !!tx;
                checkPoints.push({
                    name: '升级交易可验证',
                    passed: txExists,
                    message: txExists ? `✅ 交易哈希: ${CONFIG.UPGRADE_TX_HASH}` : '❌ 交易不存在'
                });
            }
            catch (error) {
                checkPoints.push({
                    name: '升级交易可验证',
                    passed: false,
                    message: `❌ 交易验证失败: ${error.message}`
                });
            }
        }
        catch (error) {
            Logger.error(`报告生成失败: ${error.message}`);
        }
        // 显示检查结果
        console.log('\n📋 验证结果汇总:');
        let passedCount = 0;
        checkPoints.forEach((point, index) => {
            console.log(`   ${point.passed ? '✅' : '❌'} ${index + 1}. ${point.name}`);
            console.log(`      ${point.message}`);
            if (point.passed)
                passedCount++;
        });
        const totalChecks = checkPoints.length;
        const passRate = (passedCount / totalChecks) * 100;
        console.log(`\n📊 统计信息:`);
        console.log(`   总检查项: ${totalChecks}`);
        console.log(`   通过项: ${passedCount}`);
        console.log(`   失败项: ${totalChecks - passedCount}`);
        console.log(`   通过率: ${passRate.toFixed(1)}%`);
        // 显示结果图标
        console.log('\n' + '='.repeat(70));
        if (passedCount === totalChecks) {
            console.log('🎉 完美！所有检查项都通过了！合约升级完全成功！');
        }
        else if (passRate >= 80) {
            console.log('👍 良好！大部分检查项通过了，合约升级基本成功！');
        }
        else if (passRate >= 60) {
            console.log('⚠️  一般！部分检查项未通过，需要进一步检查。');
        }
        else {
            console.log('❌ 较差！多数检查项未通过，可能存在严重问题。');
        }
        console.log('='.repeat(70));
        // 提供区块浏览器链接
        console.log('\n🌐 区块浏览器链接:');
        Logger.link('代理合约', `https://moonbase.moonscan.io/address/${CONFIG.PROXY_ADDRESS}`);
        Logger.link('V1合约', `https://moonbase.moonscan.io/address/${CONFIG.V1_ADDRESS}`);
        Logger.link('V2合约', `https://moonbase.moonscan.io/address/${CONFIG.V2_ADDRESS}`);
        Logger.link('升级交易', `https://moonbase.moonscan.io/tx/${CONFIG.UPGRADE_TX_HASH}`);
        // 生成JSON格式报告
        const report = {
            timestamp: new Date().toISOString(),
            network: 'moonbase-alpha',
            chainId: 1287,
            addresses: {
                proxy: CONFIG.PROXY_ADDRESS,
                v1: CONFIG.V1_ADDRESS,
                v2: CONFIG.V2_ADDRESS
            },
            upgradeTransaction: CONFIG.UPGRADE_TX_HASH,
            checks: checkPoints.map(p => ({
                name: p.name,
                passed: p.passed,
                message: p.message.replace('✅ ', '').replace('❌ ', '')
            })),
            summary: {
                total: totalChecks,
                passed: passedCount,
                failed: totalChecks - passedCount,
                passRate: `${passRate.toFixed(1)}%`,
                status: passedCount === totalChecks ? '完全成功' :
                    passRate >= 80 ? '基本成功' :
                        passRate >= 60 ? '需要检查' : '存在严重问题'
            }
        };
        console.log('\n📄 JSON报告 (复制到README):');
        console.log(JSON.stringify(report, null, 2));
        // 保存到文件
        try {
            const fs = require('fs');
            const filename = `upgrade-report-${Date.now()}.json`;
            fs.writeFileSync(filename, JSON.stringify(report, null, 2));
            Logger.success(`报告已保存到: ${filename}`);
        }
        catch (error) {
            // 忽略文件保存错误
        }
    }
}
// 创建并运行检查器
async function main() {
    console.log(`
  ███╗   ███╗ ██████╗  ██████╗ ███╗   ██╗██████╗  █████╗ ███████╗███████╗
  ████╗ ████║██╔═══██╗██╔═══██╗████╗  ██║██╔══██╗██╔══██╗██╔════╝██╔════╝
  ██╔████╔██║██║   ██║██║   ██║██╔██╗ ██║██████╔╝███████║███████╗█████╗  
  ██║╚██╔╝██║██║   ██║██║   ██║██║╚██╗██║██╔══██╗██╔══██║╚════██║██╔══╝  
  ██║ ╚═╝ ██║╚██████╔╝╚██████╔╝██║ ╚████║██████╔╝██║  ██║███████║███████╗
  ╚═╝     ╚═╝ ╚═════╝  ╚═════╝ ╚═╝  ╚═══╝╚═════╝ ╚═╝  ╚═╝╚══════╝╚══════╝
  
  Moonbase Alpha 合约升级验证工具 v2.0
  `);
    const checker = new UpgradeChecker();
    await checker.checkAll();
}
// 运行主函数
main().catch(error => {
    console.error('程序执行失败:', error);
    process.exit(1);
});
