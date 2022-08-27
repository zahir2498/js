(function (window, $){
	"use strict"	
	var MVPCacheManager = function(cid){

		var self = this,
			db,
			dbName = 'playlistData'

		if("indexedDB" in window) {
	    	
	        var openRequest = indexedDB.open(cid,1);
	 
	        openRequest.onupgradeneeded = function(e) {
	            if (!openRequest.result.objectStoreNames.contains(dbName)) {
		            openRequest.result.createObjectStore(dbName, { keyPath: "id" })
		        }
	        }
	        openRequest.onsuccess = function(e) {
	            db = openRequest.result;
				//$(self).trigger("MVPCacheManager.DB_READY");
				self.getData();
	        }
	        openRequest.onerror = function(e) {
	            console.log(openRequest.errorCode);
	        }
	 
	    }

	    this.saveData = function(data) {

		    var transaction = db.transaction(dbName, 'readwrite');
    		var store = transaction.objectStore(dbName);

            var request = store.put({id:0, value: data});

            request.onerror = function(e) {
		        console.log("Error",e.target.error.name); 	
		    }
		    request.onsuccess = function(e) {
		    	//console.log('saveData onsuccess')
		    }
		    transaction.oncomplete = function(e) {
			   // db.close();
			};
	       
		}

		this.getData = function() {
		 
		    var transaction = db.transaction(dbName, 'readonly');
		    var store = transaction.objectStore(dbName);
		
		    var request = store.get(0);

		    request.onsuccess = function(e) {
		        var result = e.target.result;
		        $(self).trigger("MVPCacheManager.GET_DATA", result);
		    } 
		    request.onerror = function (e) {
                console.log("Error",e.target.error.name);
            };
            transaction.oncomplete = function(e) {
			    //db.close();
			};
		}   

		this.deleteData = function() {
		 
		    var transaction = db.transaction(dbName, 'readwrite');
		    var store = transaction.objectStore(dbName);
		 
		    var request = store.delete(0);

		    request.onsuccess = function(e) {
		        var result = e.target.result;
		    } 
		    request.onerror = function (e) {
                console.log("Error",e.target.error.name);
            };
            transaction.oncomplete = function(e) {
			    //db.close();
			};
		}   

	};	

	window.MVPCacheManager = MVPCacheManager;

}(window,jQuery));