# Chess-API
A RESTful API with Chess logic made from scratch using TypeScript + Express.JS.

## Summarized list of API Endpoints:
GET -- `/api` -- Status route, can be used for measuring ping. <br>
GET -- `/api/games/new` -- Creates and returns a new game. <br>
GET -- `/api/games/:gameID` -- Returns the game info of the specified game ID. <br>
GET -- `/api/games/:gameID/moves/:pieceUID` -- Returns the valid moves (encoded) of the specified piece. <br>
POST -- `/api/games/:gameID/moves/:pieceUID` -- Moves the specified piece (pieceUID parameter in URL) to a specified position (moveTo property in JSON body)<br>

## Description of API Endpoints
### Status route
<details>
 <summary><code>GET</code> <code><b>/api</b></code> <code>(Returns the status of the API)</code></summary>

##### Parameters
<code>None</code>

##### Response(s)

> |   http code   |    content-type    | response                                            |
> |---------------|--------------------|-----------------------------------------------------|
> |     `200`     | `application/json` | `{"status": "success", "timestamp": 1729072605904}` |

</details>

### Create a new chess game:
<details>
 <summary><code>GET</code> <code><b>/api/games/new</b></code> <code>(Creates a new game and returns the game's information.)</code></summary>

##### Parameters
<code>None</code>

##### Response(s)

> |   http code   |    content-type    | response                              |
> |---------------|--------------------|---------------------------------------|
> |     `200`     | `application/json` | `{"status": "success", "game": {...}` |

</details>

### Get a game's information by ID:
<details>
 <summary><code>GET</code> <code><b>/api/games/:gameID</b></code> <code>(Returns the game information of the specified game ID.)</code></summary>

##### Parameters
> | name     |   type    | data type | description                |
> |----------|-----------|-----------|----------------------------|
> |  gameID  | required  |  number   | The unique ID of the game. |

##### Response(s)

> |   http code   |   content-type     | response                                                                  |
> |---------------|--------------------|---------------------------------------------------------------------------|
> |     `200`     | `application/json` | `{"status": "success", timestamp: 1729072605904, data: {...}, errors: []}`|
> |     `404`     |     `text/html`    | `<html><body>NOT FOUND</body></html>`                                     |

</details>

### Get moves of a piece:
<details>
 <summary><code>GET</code> <code><b>/api/games/:gameID/moves/:pieceUID</b></code> <code>(Returns valid moves of the specified piece.)</code></summary>

##### Parameters
> | name       |   type   | data type | description                |
> |------------|----------|-----------|----------------------------|
> |  gameID    | required |  number   | The unique ID of the game. |
> |  pieceUID  | required |  number   | The unique ID of the piece.|

##### Response(s)

> | http code |    content-type    | response                                                                       |
> |-----------|--------------------|--------------------------------------------------------------------------------|
> |   `200`   | `application/json` | `{"status": "success", "moves": [...] }`                                       |
> |   `404`   | `application/json` | `{"status": "failed", "message": "No piece exists for the specified UID." }`   |
> |   `404`   |    `text/html`     | `<html><body>NOT FOUND</body></html>`                                          |
> |   `501`   | `application/json` | `{"status": "failed", "message": "An error occured while generating moves." }` |

</details>

### Moving a piece:
<details>
 <summary><code>POST</code> <code><b>/api/games/:gameID/moves/:pieceUID</b></code> <code>(Moves the specified piece in the specified game to the specified position. (don't mind the alliteration)</code></summary>

##### Parameters
<code>none</code>

##### Body (JSON) properties

> |   property   |  type  |  required |  applies to  |               information                                                                                                         |
> |------------- |--------|-----------|--------------|-----------------------------------------------------------------------------------------------------------------------------------|
> |    moveTo    | string |    yes    | `All pieces` | `The position where the piece should move to.`                                                                                    |
> |    killPos   | string |    no     | `All pieces` | `The position of the piece that is to be captured; This value is different from "moveTo" property only in case of an en passant.` |
> |   promoteTo  | string |    no     |    `Pawn`    | `The piece that the pawn should be promoted to; Valid values are: "r, n, q, b" - Rook, Knight, Queen, and Bishop respectively.`   |
> | castleTarget | string |    no     |    `King`    | `The position of the rook that is to be castled with.`                                                                            |

##### Response(s)

> | http code |    content-type    | response                                                                                         |
> |-----------|--------------------|--------------------------------------------------------------------------------------------------|
> |   `200`   | `application/json` | `{"status": "success", game: {...}}`                                                             |
> |   `400`   | `application/json` | `{"status": "failed", "message": "Invalid move." }`                                              |
> |   `400`   | `application/json` | `{"status": "failed", "message": "It is not your turn." }`                                       |
> |   `404`   |    `text/html`     | `<html><body>NOT FOUND</body></html>`                                                            |
> |   `404`   | `application/json` | `{"status": "failed", "message": "No piece exists for the specified UID." }`                     |
> |   `501`   | `application/json` | `{"status": "failed", "message": "An error occured while trying to move the specified piece." }` |

</details>

------------------------------------------------------------------------------------------
## Setup:

1. Navigate to project's base directory from a terminal.
1. Run <code>yarn install</code> or <code>npm install</code>.
2. Run <code>yarn start</code> or <code>npm start</code>.
   - The application will start listening for requests at port 3000.

------------------------------------------------------------------------------------------