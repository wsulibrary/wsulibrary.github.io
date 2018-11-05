angular.module('lapentor.app')
    .factory('SceneGroup', SceneGroup);

function SceneGroup($q, $http, $state, envService, Alertify) {
    var groups = null;
    var service = {
        all: all,
        get: get,
        create: create,
        update: update,
        updateAll: updateAll,
        remove: remove,
    };

    return service;

    ///////// API calls

    function all(project_id) {
        var d = $q.defer();
        if (groups) {
            d.resolve(groups);
        } else {
            $http.get(envService.read('apiUrl') + '/groups', {
                    params: { project_id: project_id }
                })
                .then(function(res) {
                    d.resolve(res.data);
                }, function(res) {
                    console.log('ERR: Get all groups', res);
                    d.reject(res);
                });
        }

        return d.promise;
    }

    function create(title, project_id) {
        var d = $q.defer();
        $http.post(envService.read('apiUrl') + '/group/create', {
            title: title,
            project_id: project_id
        }).then(function(res) {
            d.resolve(res.data);
        }, function(res) {
            console.log('ERR: Create group', res);
            d.reject(res);
        });
        
        return d.promise;
    }

    function update(group) {
        var d = $q.defer();
        $http.put(envService.read('apiUrl') + '/group/' + group._id, group).then(function (res) {
            if(res.data.status == 1) {
                d.resolve(true);
            }else{
                d.reject(false);
            }
        }, function (res) {
            console.log('ERR: ',res);
            d.reject(false);
        });
        return d.promise;
    }

    function updateAll(groups) {
        var d = $q.defer();
        $http.put(envService.read('apiUrl') + '/groups', {groups: groups}).then(function (res) {
            if(res.data.status == 1) {
                d.resolve(true);
            }else{
                d.reject(false);
            }
        }, function (res) {
            console.log(res);
            d.reject(false);
        });
        return d.promise;
    }

    function get(id) {
        var d = $q.defer();
        $http.get(envService.read('apiUrl') + '/group/' + id)
            .then(function(res) {
                d.resolve(res.data);
            }, function(res) {
                console.log('ERR: Get group', res);
                d.reject(res);
            });

        return d.promise;
    }

    function remove(id) {
        var d = $q.defer();
        $http.delete(envService.read('apiUrl') + '/group/' + id).then(function (res) {
            if(res.data.status == 1) {
                d.resolve(true);
            }else{
                Alertify.error("Can not delete group");
                console.log(res);
                d.reject(false);
            }
        }, function (res) {
            Alertify.error("Can not delete group");
            console.log(res);
            d.reject(false);
        });

        return d.promise;
    }
}
