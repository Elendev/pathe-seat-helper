/**
 */

(() => {

    /**
     * Download the seat map from the Pathe webservice, since we don't have access to the already downloaded seat map
     */

    let seatMap = null;

    getSeatMap(); //retrieve the seatMap on page load

    document.addEventListener('click', async event => {
        let element = event.target;

        if (element.classList.contains('a-seat')) {
            console.log(await getSeatFromDataId(element.dataset.id));
        }
    });


    /**
     * Download and return the seat map
     * @returns {Promise<Map<Number, Object>>}
     */
    async function getSeatMap() {


        if (seatMap === null) {

            let cinemaAndSession = getCinemaAndSession();

            let response = await fetch('https://pathe.ch/vistafr/wsvistawebclient/restdata.svc/cinemas/' + cinemaAndSession.cinema + '/Sessions/' + cinemaAndSession.session + '/seat-plan');

            if (response.ok) {
                let jsonResponse = await response.json();

                seatMap = new Map();

                for (let area of jsonResponse.SeatLayoutData.Areas) {
                    for (let rowId in area.Rows) {

                        if (area.Rows.hasOwnProperty(rowId)) {
                            if (area.Rows[rowId].Seats.length > 0) {
                                if (!seatMap.has(rowId)){
                                    seatMap.set(rowId, {
                                        name: area.Rows[rowId].PhysicalName,
                                        seats: new Map()
                                    });
                                }

                                for (let seatId in area.Rows[rowId].Seats) {
                                    seatMap.get(rowId).seats.set(seatId, {
                                        name: area.Rows[rowId].Seats[seatId].Id
                                    })
                                }
                            }
                        }
                    }
                }
            }

        }

        return seatMap;
    }


    /**
     * @typedef {Object} CinemaAndSession
     * @property {String} cinema The cinema code
     * @property {String} session The session code
     */

    /**
     * Return the cinema and the session based on the location.hash
     *
     * @return {CinemaAndSession}
     */
    function getCinemaAndSession() {
        let hashRegex = /^#\/([A-Z]+)\/[A-Z]+([0-9]+)$/;

        let result = hashRegex.exec(location.hash);

        return {
            cinema: result[1],
            session: result[2],
        };
    }


    /**
     * @typedef {Object} CinemaSeat
     * @property {String} row The row name
     * @property {String} seat the seat number
     */
    /**
     * Return the seat and the row from the given data-id
     * @param id
     * @return CinemaSeat
     * @throw error not seat not found
     */
    async function getSeatFromDataId(id) {

        let dataIdRegex = /^[0-9]+-([0-9]+)-([0-9]+)-[0-9]+$/

        let result = dataIdRegex.exec(id);

        if (result.length < 3) {
            throw 'ID ' + id + ' not recognized as data-id';
        }

        let seatMap = await getSeatMap();

        if (seatMap.has(result[1])) {
            let row = seatMap.get(result[1]);

            if (row.seats.has(result[2])) {
                return {
                    row: row.name,
                    seat: row.seats.get(result[2]).name
                }
            } else {
                throw 'Seat ' + result[2] + ' not found in the row ' + row.name + ' (' + result[1] + ')';
            }
        } else {
            throw 'Row ' + result[1] + ' not found in the seat map';
        }
    }

})();





