module Nicr.Service {

    export class Menu extends Event {

        constructor(args:{}) {
            super();
        }

        openContextMenu(args:any) {
            this.emit('open:contextmenu', args);
        }
    }
}