'use strict';

const Web3 = require('web3');
const AbiBinProvider = require('../../AbiBinProvider');

class LibsHelper {
  constructor(web3, merklePatriciaProof, messageBus, gatewayLib) {
    const oThis = this;
    oThis.web3 = web3;
    oThis.merklePatriciaProof = merklePatriciaProof;
    oThis.messageBus = messageBus;
    oThis.gatewayLib = gatewayLib;
    oThis.abiBinProvider = new AbiBinProvider();
  }

  /*
  //Supported Configurations for setup
  {
    deployer: config.deployerAddress,
  }
  Both deployer, chainOwner & valueToken are mandatory configurations.
*/

  setup(config, txOptions, web3) {
    const oThis = this;
    web3 = web3 || oThis.web3;

    LibsHelper.validateSetupConfig(config);

    if (!txOptions) {
      txOptions = txOptions || {};
    }

    if (typeof txOptions.gasPrice === 'undefined') {
      txOptions.gasPrice = '0';
    }

    let deployParams = Object.assign({}, txOptions);
    deployParams.from = config.deployer;
    deployParams.gasPrice = deployParams.gasPrice || '0';

    //1. Deploy MerklePatriciaProof
    let promiseChain = oThis.deployMerklePatriciaProof(deployParams);

    //2. deploy MessageBus
    promiseChain = promiseChain.then(function() {
      return oThis.deployMessageBus(null, deployParams);
    });

    //3. Deploy GatewayLib
    promiseChain = promiseChain.then(function() {
      return oThis.deployGatewayLib(null, deployParams);
    });

    return promiseChain;
  }

  static validateSetupConfig(config) {
    console.log('* Validating Libs Setup Config.');
    if (!config) {
      throw new Error('Mandatory parameter "config" missing. ');
    }

    if (!config.deployer) {
      throw new Error('Mandatory configuration "deployer" missing. Set config.deployer address');
    }
    return true;
  }

  deployMerklePatriciaProof(txOptions, web3) {
    const oThis = this;
    web3 = web3 || oThis.web3;
    const LibName = 'MerklePatriciaProof';

    const abiBinProvider = oThis.abiBinProvider;
    const abi = abiBinProvider.getABI(LibName);
    const bin = abiBinProvider.getBIN(LibName);

    let defaultOptions = {
      gas: '3000000'
    };

    if (txOptions) {
      Object.assign(defaultOptions, txOptions);
    }
    txOptions = defaultOptions;

    let args = [];
    const contract = new web3.eth.Contract(abi, null, txOptions);
    let tx = contract.deploy(
      {
        data: bin,
        arguments: args
      },
      txOptions
    );

    console.log(`* Deploying ${LibName} Contract`);
    let txReceipt;
    return tx
      .send(txOptions)
      .on('transactionHash', function(transactionHash) {
        console.log('\t - transaction hash:', transactionHash);
      })
      .on('error', function(error) {
        console.log('\t !! Error !!', error, '\n\t !! ERROR !!\n');
        return Promise.reject(error);
      })
      .on('receipt', function(receipt) {
        txReceipt = receipt;
        console.log('\t - Receipt:\n\x1b[2m', JSON.stringify(receipt), '\x1b[0m\n');
      })
      .then(function(instace) {
        oThis.merklePatriciaProof = instace.options.address;
        console.log(`\t - ${LibName} Contract Address:`, oThis.merklePatriciaProof);
        return txReceipt;
      });
  }

  deployMessageBus(merklePatriciaProof, txOptions, web3) {
    const oThis = this;
    const LibName = 'MessageBus';
    web3 = web3 || oThis.web3;

    merklePatriciaProof = merklePatriciaProof || oThis.merklePatriciaProof;
    let merklePatriciaProofInfo = {
      name: 'MerklePatriciaProof',
      address: merklePatriciaProof
    };

    const abiBinProvider = oThis.abiBinProvider;
    const abi = abiBinProvider.getABI(LibName);
    const bin = abiBinProvider.getLinkedBIN(LibName, merklePatriciaProofInfo);

    let defaultOptions = {
      gas: '5000000'
    };

    if (txOptions) {
      Object.assign(defaultOptions, txOptions);
    }
    txOptions = defaultOptions;

    let args = [];
    const contract = new web3.eth.Contract(abi, null, txOptions);
    let tx = contract.deploy(
      {
        data: bin,
        arguments: args
      },
      txOptions
    );

    console.log(`* Deploying ${LibName} Contract`);
    let txReceipt;
    return tx
      .send(txOptions)
      .on('transactionHash', function(transactionHash) {
        console.log('\t - transaction hash:', transactionHash);
      })
      .on('error', function(error) {
        console.log('\t !! Error !!', error, '\n\t !! ERROR !!\n');
        return Promise.reject(error);
      })
      .on('receipt', function(receipt) {
        txReceipt = receipt;
        console.log('\t - Receipt:\n\x1b[2m', JSON.stringify(receipt), '\x1b[0m\n');
      })
      .then(function(instace) {
        oThis.messageBus = instace.options.address;
        console.log(`\t - ${LibName} Contract Address:`, oThis.messageBus);
        return txReceipt;
      });
  }

  deployGatewayLib(merklePatriciaProof, txOptions, web3) {
    const oThis = this;
    web3 = web3 || oThis.web3;
    const LibName = 'GatewayLib';

    merklePatriciaProof = merklePatriciaProof || oThis.merklePatriciaProof;
    let merklePatriciaProofInfo = {
      name: 'MerklePatriciaProof',
      address: merklePatriciaProof
    };

    const abiBinProvider = oThis.abiBinProvider;
    const abi = abiBinProvider.getABI(LibName);
    const bin = abiBinProvider.getLinkedBIN(LibName, merklePatriciaProofInfo);

    let defaultOptions = {
      gas: '2000000'
    };

    if (txOptions) {
      Object.assign(defaultOptions, txOptions);
    }
    txOptions = defaultOptions;

    let args = [];
    const contract = new web3.eth.Contract(abi, null, txOptions);
    let tx = contract.deploy(
      {
        data: bin,
        arguments: args
      },
      txOptions
    );

    console.log(`* Deploying ${LibName} Contract`);
    let txReceipt;
    return tx
      .send(txOptions)
      .on('transactionHash', function(transactionHash) {
        console.log('\t - transaction hash:', transactionHash);
      })
      .on('error', function(error) {
        console.log('\t !! Error !!', error, '\n\t !! ERROR !!\n');
        return Promise.reject(error);
      })
      .on('receipt', function(receipt) {
        txReceipt = receipt;
        console.log('\t - Receipt:\n\x1b[2m', JSON.stringify(receipt), '\x1b[0m\n');
      })
      .then(function(instace) {
        oThis.gatewayLib = instace.options.address;
        console.log(`\t - ${LibName} Contract Address:`, oThis.gatewayLib);
        return txReceipt;
      });
  }
}

module.exports = LibsHelper;
