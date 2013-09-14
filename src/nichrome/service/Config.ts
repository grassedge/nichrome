module Nicr.Service {
    export class Config {

        storage:Storage;

        constructor() {
            this.storage = window.localStorage;
        }

        setBBSContainerVisibility(visible:boolean) {
            this.storage.setItem('nicr:config:show-bbs-container', visible ? 'true' : 'false');
        }
        getBBSContainerVisibility():boolean {
            return this.storage.getItem('nicr:config:show-bbs-container') !== 'false';
        }

        setBoardContainerWidth(width:number) {
            this.storage.setItem('nicr:config:board-container-width', width + '');
        }
        getBoardContainerWidth():number {
            return +this.storage.getItem('nicr:config:board-container-width') || 325;
        }
    }
}