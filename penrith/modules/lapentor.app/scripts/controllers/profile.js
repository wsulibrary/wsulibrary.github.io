angular.module('lapentor.app')
    .controller('ProfileCtrl', ProfileCtrl);

function ProfileCtrl($scope, $rootScope, Alertify, envService, Upload, user, User) {
    var vm = this;
    vm.user = user;
    vm.card = {}; // empty card for updating card detail
    vm.isSaving = false;
    vm.preview = [];

    vm.saveProfile = saveProfile;
    vm.upload = upload;
    vm.updateCard = updateCard;
    vm.cancelSubscription = cancelSubscription;
    vm.resumeSubscription = resumeSubscription;

    ////////////////

    function cancelSubscription() {
        Alertify.confirm("Do you really want to cancel your subscription? This action is irreversible").then(function() {
            if (vm.isLoading) return;
            vm.isLoading = true;
            User.cancelSubscription().then(function(res) {
                if (res.status == 1) {
                    Alertify.success('Your subscription is cancelled');
                    vm.user = res.user;
                }
            }, function(res) {
                Alertify.error('Sorry. Please try again');
            }).finally(function() {
                vm.isLoading = false;
            });
        });
    }

    function resumeSubscription() {
        if (vm.isLoading) return;
        vm.isLoading = true;
        User.resumeSubscription().then(function(res) {
            if (res.status == 1) {
                Alertify.success('Welcome back :D');
                vm.user = res.user;
            }
        }, function(res) {
            Alertify.error('Sorry. Please try again');
        }).finally(function() {
            vm.isLoading = false;
        });
    }

    function updateCard() {
        // Prevent repeated click
        if (vm.isLoading) return;
        // Request a token from Stripe:
        vm.isLoading = true;
        Stripe.card.createToken(vm.card, stripeResponseHandler);
    }

    function stripeResponseHandler(status, response) {
        if (response.error) { // Problem!
            // Show the errors on the form:
            Alertify.error(response.error.message);
            vm.isLoading = false;
        } else { // Token was created!
            // Get the token ID:
            var token = response.id;

            // Insert the token ID into the form so it gets submitted to the server:
            // Submit the form:
            User.updateCard(token).then(function(res) {
                if (res.status == 1) {
                    vm.card = {}; // clear form
                    Alertify.success('Your card is updated');
                    vm.user = res.user;
                    vm.showUpdateCardDetailForm = false;
                }
            }, function(res) {
                Alertify.error('Sorry. Your card is not valid. Please try again');
            }).finally(function() {
                vm.isLoading = false;
            });
        }
    };

    function upload(files, type) {
        if (files && files.length) {
            vm.preview[type] = files[0];

            vm.isUploading = true;

            Upload.upload({
                url: envService.read('apiUrl') + '/user/upload',
                method: 'post',
                data: {
                    file: files[0],
                    type: type
                }
            }).then(function(res) {
                vm.user[type] = res.data.url;
            }, function(res) {
                Alertify.error('Can not upload file');
                vm.preview[type] = null;
            }, function(evt) {
                // progress
                var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                vm.uploadProgress = progressPercentage;
            }).finally(function() {
                vm.isUploading = false;
                vm.uploadProgress = 0;
            });
        }
    }

    function saveProfile() {
        if (vm.user.password && vm.user.password != vm.user.repassword) {
            Alertify.error("Password confirmation is not match. Please try again");
            return false;
        }
        if (vm.user.first_name == '' && vm.user.last_name == '') {
            Alertify.error("Please enter your name");
            return false;
        }
        vm.isSaving = true;

        User.update(vm.user).then(function() {
            Alertify.success('Profile saved');
        }).finally(function() {
            vm.isSaving = false;
        });
    }
}
