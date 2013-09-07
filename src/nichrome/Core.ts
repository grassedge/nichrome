module Nicr {

    interface Route { path:string; action:Action; }
    export interface Action {
        (match:any, location:Location, promise:JQueryPromise<Location>):void;
    }

    export class Router {

        private routes: Route[];
        private guard: JQueryDeferred<Location>;

        constructor() {
            this.routes = [];
            this.guard = $.Deferred();
        }

        connect(path:string, action:Action);
        connect(path:RegExp, action:Action);
        connect(path:any, action:Action) {
            if (!(path instanceof RegExp)) {
                path = new RegExp(path);
            }
            this.routes.push({path:path, action:action});
        }

        dispatch(location:Location) {
            this.guard.resolve(location);
            this.guard = $.Deferred();
            var path = location.pathname;
            for (var i = 0, route:Route; route = this.routes[i]; i++) {
                var match = path.match(route.path);
                if (!match) continue;
                route.action(match, location, this.guard.promise());
            }
        }
    }

    export var router = new Router();

    export class Navigator {
        navigate(path:string, ...values:any[]) {
            history.pushState(values, null, path);
            $(document).trigger('dispatch', values);
        }
    }

    export var navigator = new Navigator();
}