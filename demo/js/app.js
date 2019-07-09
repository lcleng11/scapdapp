App = {
	$web3js: null,
	$contractAddress: '0xd404cEa889d773a9F17b2af183912c753dE2C135',
	$tokenContract: null,
	$contractInstance: null,
	$myAddress: null,
	$version: null,

	init: async function () {
		// Load pets.
		$.getJSON('pets.json', function (data) {
			var petsRow = $('#petsRow');
			var petTemplate = $('#petTemplate');

			for (i = 0; i < data.length; i++) {
				petTemplate.find('.panel-title').text(data[i].name);
				petTemplate.find('img').attr('src', data[i].picture);
				petTemplate.find('.pet-breed').text(data[i].breed);
				petTemplate.find('.pet-age').text(data[i].age);
				petTemplate.find('.pet-location').text(data[i].location);
				petTemplate.find('.btn-adopt').attr('data-id', data[i].id);

				petsRow.append(petTemplate.html());
			}
		});

		return await App.initWeb3();
	},

	initWeb3: async function () {
		if (window.ethereum) {
			try {
				// Request account access
				await window.ethereum.enable();
				App.$web3js = new Web3(window.ethereum);
			} catch (error) {
				// User denied account access...
				console.error("User denied account access")
			}
		} else if (typeof web3 !== 'undefined') {
            App.$web3js = new Web3(web3.currentProvider);
            if (web3.version.getNetwork) {
                App.$version = web3.version.api
            } else {
                App.$version = "1"         
            }
        } else {
            alert('current environment not support dapps')
		}	
		App.$web3js.eth.getAccounts(function (err, accounts) {
			App.$myAddress = accounts[0];
		});
		App.markAdopted();
		return App.bindEvents();
	},

	bindEvents: function () {
		$(document).on('click', '.btn-adopt', App.handleAdopt);
	},

	markAdopted: function () {
		$.getJSON('abi.json', function (abi) {
			if(App.$version != '1'){
				App.$tokenContract = App.$web3js.eth.contract(abi);
				App.$contractInstance = App.$tokenContract.at(App.$contractAddress);
				App.$contractInstance.getAdopters(function(error, adopters){
					if(error){
						alert(error)
					} else {
						for (i = 0; i < adopters.length; i++) {
							if (adopters[i] !== '0x0000000000000000000000000000000000000000') {
								$('.panel-pet').eq(i).find('button').text('Success').attr('disabled', true);
							}
						}
					}
				})
			} else {
				App.$contractInstance = new web3.eth.Contract(abi, App.$contractAddress);
				App.$contractInstance.methods.getAdopters().call().call().then(function(){
					//...
				})
			}
		})
	},

	handleAdopt: function (event) {
		event.preventDefault();

		var petId = parseInt($(event.target).data('id'));

		if(App.$myAddress){
			if(App.$version != '1'){
				App.$contractInstance.adopt(petId, {from: App.$myAddress}, function(error, txhash){
					if(error){
						alert(error)
					} else {
						console.log(txhash)
					}
				})
			} else {
				//App.$contractInstance.methods.adopt(petId, {from: App.$myAddress}).call()
				//...
			}

		} else {
			alert('current environment not support dapps')
		}
	}

};

$(function () {
	$(window).load(function () {
		App.init();
	});
});
