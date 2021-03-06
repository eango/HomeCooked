'use strict';
angular.module('HomeCooked.services')
  .factory('ChefService', ['$q', '$http', '$timeout', 'ENV', '_',
    function($q, $http, $timeout, ENV, _) {
      var baseUrl = ENV.BASE_URL + '/api/v1/';

      var ordersReady;

      var handleResponses = function(httpPromise) {
        var deferred = $q.defer();
        httpPromise
          .then(function(response) {
            deferred.resolve(response.data);
          })
          .catch(function(error) {
            deferred.reject(error.data);
          });
        return deferred.promise;
      };
      var wait = function(ms) {
        return $timeout(function() {
        }, ms || 0);
      };

      var getOrders = function() {
        ordersReady = ordersReady || handleResponses($http.get('mock/orders.json'));
        return ordersReady;
      };

      var getBatches = function() {
        return handleResponses($http.get(baseUrl + 'batches/'));
      };

      var getDishes = function() {
        return handleResponses($http.get(baseUrl + 'dishes/'));
      };

      var addDish = function(dish) {
        return handleResponses($http.post(baseUrl + 'dishes/', dish)).then(getDishes);
      };


      var addBatch = function(batch) {
        return handleResponses($http.post(baseUrl + 'batches/', batch)).then(getBatches);
      };

      var removeBatchAvailablePortions = function(batch) {
        //FIXME remove this and call the service
        return $q.all([getBatches(), wait(300)])
          .then(function(values) {
            var batches = values[0];
            var i = _.findIndex(batches, {'dishId': batch.dishId, 'price': batch.price});
            if (i >= 0) {
              var localBatch = batches[i];
              localBatch.quantity = localBatch.quantityOrdered;
              //will remove current batch if empty
              if (localBatch.quantity === 0) {
                batches.splice(i, 1);
              }
            }

            return batches;
          });

        //return handleResponses($http.delete(baseUrl + 'batches/' + batch.id)).then(getBatches);
      };

      var getChefData = function() {
        //TODO read this from server!!
        var chefData = {
          maxPrice: 100,
          maxQuantity: 25,
          maxBatches: 3
        };
        return $q.when(chefData);
      };

      var getChefInfo = function(chefId) {
        return handleResponses($http.get(baseUrl + 'chefs/' + chefId + '/'));
      };

      return {
        getOrders: getOrders,
        getBatches: getBatches,
        getDishes: getDishes,
        addDish: addDish,
        addBatch: addBatch,
        removeBatchAvailablePortions: removeBatchAvailablePortions,
        getChefData: getChefData,
        getChefInfo: getChefInfo
      };
    }]
);
