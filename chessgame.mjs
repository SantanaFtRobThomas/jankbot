
const jsChessEngine = require("js-chess-engine");
const { stringify } = require("querystring");

class ChessGame {
    constructor(pvp, white_player, black_player) {
        this.the_game = new jsChessEngine.Game();
        this.white_player = white_player;
        this.black_player = black_player;
        this.the_board = new ChessBoard(this.the_game.exportJson());
        this.is_pvp = pvp;
    }
    is_pvp = false;
    white_player = "";
    black_player = "";
    the_board = null;

    the_game = null;

    toText() {
        return this.the_board.toText();
    }

    doMove(side, move_string) {
        const game_sitch = this.the_game.exportJson();
        if (side == game_sitch["turn"]) {
            let parsed_move_string = this.parseMovestring(side == "white", move_string, game_sitch);
            if (parsed_move_string !== null) {
                this.the_game.move(parsed_move_string[0], parsed_move_string[1]);
                this.the_board.updateFromJSON(this.the_game.exportJson());
                return this.the_board.toText();
            }
        } else {
        }
    }

    parseMovestring(side, move_string, game_sitch) {
        /** @type string */
        let lower_case_move_string = move_string.toLowerCase();
        if (/^[a-h][1-8]:[a-h][1-8]/.test(move_string.toLowerCase())) return move_string.toUpperCase().split(":");
        else if (lower_case_move_string.contains(" to ")) {
            let split_on_to = lower_case_move_string.split(" to ");
            let from = "";
            let to = "";
            if (Object.keys(CHESS_REFS).includes(split_on_to[0])) {
                let piece_candidate = [];
                let piece_to_search = side ? CHESS_REFS[split_on_to[0]].toUpperCase() : CHESS_REFS[split_on_to[0]];
                for (const [loc, piece] of Object.entries(game_sitch["pieces"])) {
                    if (piece == piece_to_search) piece_candidate.push(loc);
                }

                if (/[a-h][1-8]/.test(split_on_to[1])) {
                    to = split_on_to[1].toUpperCase();
                }
                let valid_moves = [];
                if (piece_candidate.length > 0) {
                    for (let loc of piece_candidate) {
                        if (game_sitch["moves"][loc] != null) {
                            if (game_sitch["moves"][loc].includes(to)) valid_moves.push(loc);
                        }
                    }
                    if (valid_moves.length == 1) {
                        return [valid_moves[0], to];
                    }
                }
            }
        }
    }
}

const CHESS_REFS = {
    rook: "r",
    bishop: "b",
    knight: "n",
    queen: "q",
    king: "k",
    pawn: "p",
};

class ChessBoard {
    constructor(json_in) {
        this.updateFromJSON(json_in);
    }

    abcd = ["A", "B", "C", "D", "E", "F", "G", "H"];
    rows = ["8", "7", "6", "5", "4", "3", "2", "1"];

    updateFromJSON(json_in) {
        //clear board
        for (let row of this.rows) this[row] = new Array(8).fill(0);
        //populate board
        for (let loc in json_in["pieces"]) {
            this[loc[1].toString()][this.abcd.indexOf(loc[0])] = PIECES[json_in["pieces"][loc]];
        }
        for (let i = 0; i < 8; i++) {
            let letter = this.rows[i];
            for (let e = 0; e < 8; e++) {
                if (this[letter][e] == 0) {
                    this[letter][e] = i % 2 == 0 ? (e % 2 == 0 ? PIECES.BLK : PIECES.WHT) : e % 2 == 0 ? PIECES.WHT : PIECES.BLK;
                }
            }
        }
    }

    toText() {
        let txt = `\`\`\`
  A B C D E F G H\n`;
        for (let row of this.rows) {
            txt += `${row} `;
            for (let e of this[row]) txt += `${e} `;
            txt += "\n";
        }
        txt += "```";
        return txt;
    }
}

const PIECES = {
    R: "R",
    N: "N",
    B: "B",
    Q: "Q",
    K: "K",
    P: "P",
    r: "r",
    n: "n",
    b: "b",
    q: "q",
    k: "k",
    p: "q",
    BLK: "#",
    WHT: " ",
};

//exports.ChessGame = ChessGame;
