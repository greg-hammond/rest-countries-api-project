

const init = () => {


    const form = document.getElementById("theForm");
    const rsltDiv = document.getElementById("results");
    

    // =======================================================================
    // form "submit" handling
    // 
    form.addEventListener("submit", evt => {

        evt.preventDefault();       // cancel actual form submission

        const formData = new FormData(form);    

        // validate form data...
        // read using formData.get(element_name)

        const srch = formData.get('search');
        if (!srch) {
            alert("search text required!");
            return false;
        }
                
        runSearch(formData)
        .then( json => showResults(json));

    })
    
    // =======================================================================
    // perform the backend call (php -> REST API) to run the search
    //
    async function runSearch(formData)  {

        const resp = await fetch("restcountries.php", {
            method: "POST",
            body: formData
        });

        const rslt = await resp.json();
        console.log(rslt);
        return rslt;
    }
    
    // build out the display with the API json results
    const showResults = results => {
        
        // clear the results div
        while (rsltDiv.firstChild) {
            rsltDiv.firstChild.remove();
        }

        if (!results) {
            // general failure - absolutely nothing returned
            rsltDiv.textContent = `No data available!`;

        } else if (results.status == 404) {
            // no matches returned from api
            rsltDiv.textContent = `API returned no matches!`;

        } else {
            // normal case - 1 or more results
            // results is an array of objects...
            results.forEach( obj => {
                let div = document.createElement("div");
                div.textContent = obj.name;
                rsltDiv.appendChild(div);
            });
    
        }


    }

}



window.onload = init;
