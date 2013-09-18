/// <reference path="../d.ts/DefinitelyTyped/jquery/jquery.d.ts" />

module Nicr {

    export class IDBManager {

        static DB_NAME:string = 'nicr';
        static DB_VERSION:number = 1;
        
        idb: IDBDatabase;

        initialize() {
            var d = $.Deferred();

            var dbConnect = indexedDB.open(IDBManager.DB_NAME, IDBManager.DB_VERSION);

            dbConnect.onsuccess = (event) => {
                var target = <any>event.target;
                this.idb = <IDBDatabase>target.result;
                d.resolve(event);
            };

            dbConnect.onerror = (event) => {
                d.reject(event);
            };

            dbConnect.onupgradeneeded = (event) => {
                var target = <any>event.target;
                this.idb = <IDBDatabase>target.result;

                var oldVersion = <any>event.oldVersion;
                // var newVersion = <any>event.newVersion;

                if (oldVersion === '' || oldVersion === 0){
                    var store:IDBObjectStore = this.idb.createObjectStore('Thread', {
                        keyPath: 'id',
                        autoIncrement: false
                    });

                    var idx:IDBIndex = store.createIndex('boardKey', 'boardKey', {
                        unique: false,
                    });
                } else {
                    // code for version up.
                }
            };

            return d.promise();
        }

        // ---- thin wrapper ----

        get(storeName:string, key:any, opts:any = {}):JQueryPromise<any> {
            var txn = this.idb.transaction(storeName, 'readonly');
            var store = txn.objectStore(storeName);
            var req = store.get(key);

            var d = $.Deferred();
            req.onsuccess = function() {
                if (opts.success) opts.success(this);
                d.resolve(this.result);
            };
            req.onerror = function(e) {
                if (opts.error) opts.error(e);
                d.reject(e);
            };
            return d.promise();
        }

        put(storeName:string, data:any, opts:any = {}):JQueryPromise<any> {
            var txn = this.idb.transaction(storeName, 'readwrite');
            var store = txn.objectStore(storeName);
            var req = store.put(data);

            var d = $.Deferred();
            req.onsuccess = (e) => {
                if (opts.success) opts.success();
                d.resolve(e);
            };
            req.onerror = (e) => {
                if (opts.error) opts.error();
                d.reject(e);
            };
            return d.promise();
        }
    }
}