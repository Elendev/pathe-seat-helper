/**
 */

(() => {

    /**
     * Download the seat map from the Pathe webservice, since we don't have access to the already downloaded seat map
     */

    let seatMap = null;




    document.addEventListener('click', event => {
        let element = event.target;

        if (element.classList.contains('a-seat')) {
            console.log('The seat have been clicked :', element);
            console.log(location.href, getCinemaAndSession());
        }
    });


    /**
     * Download and return the seat map
     * @returns {Promise<void>}
     */
    let getSeatMap = async() => {

        if (seatMap === null) {

            let response = await fetch('https://pathe.ch/vistafr/wsvistawebclient/restdata.svc/cinemas/BAL/Sessions/75543/seat-plan?_=1518848683700');

        }

        return seatMap;
    };


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
    let getCinemaAndSession = () => {
        let hashRegex = /^#\/([A-Z]+)\/([A-Z]+[0-9]+)$/;

        let result = hashRegex.exec(location.hash);

        return {
            cinema: result[1],
            session: result[2],
        };
    }

})();





