/// <reference path="../d.ts/DefinitelyTyped/jquery/jquery.d.ts" />
/// <reference path="./Core.ts" />
/// <reference path="./controller/BBS.ts" />

Nicr.router.connect('index', function(match, location, guard) {
    var idbManager = new Nicr.IDBManager();

    var configService = new Nicr.Service.Config();
    var bbsService = new Nicr.Service.BBS();
    var boardService = new Nicr.Service.Board();
    var threadService = new Nicr.Service.Thread({idbManager:idbManager});

    var bbsController = new Nicr.Controller.BBS({
        $el: $('.bbs-container'),
        configService: configService,
        bbsService: bbsService,
        boardService: boardService
    });
    var boardController = new Nicr.Controller.Board({
        $el: $('.board-container'),
        configService: configService,
        boardService: boardService,
        threadService: threadService,
    });
    var threadController = new Nicr.Controller.Thread({
        $el: $('.thread-container'),
        threadService: threadService
    });

    bbsController.setup();
    boardController.setup();

    idbManager.initialize().done((event) => {
        console.log('DB connect complete');
        threadController.setup();
    }).fail((event) => {
        console.log('DB connect failed', event);
    });
});

Nicr.router.connect(/^([^\/]+?)\/(\d+)$/, function(match, location, guard) {
    console.log('hello, hoge');
});

Nicr.router.connect(/^([^\/]+)$/, function(match, location, guard) {
});

$(function () {
    $(document).on('dispatch', (event) => {
        Nicr.router.dispatch(location);
    });
    $(document).trigger('dispatch');
});