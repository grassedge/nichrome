module Nicr.Service {
    export class Thread {

        url():string {
            return;
        }

        fetch() {
            return $.get(this.url(), (data) => {
                console.log(data);
            });
        }

    }
}