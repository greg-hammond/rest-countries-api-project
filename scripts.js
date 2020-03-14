

const init = () => {


    const form = document.getElementById("theForm");
    const rsltDiv = document.getElementById("results");
    

    // =======================================================================
    // form "submit" handling
    // 
    form.addEventListener("submit", evt => {

        evt.preventDefault();       // cancel actual form submission

        const formData = new FormData(form);    


        const srch = formData.get('search');
        if (!srch) {
            showResults({"status": 404, "message": "Please enter a search term."});
            //alert("search text required!");
            //return false;
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

        if (results.status) {
            // no matches returned from api
            rsltDiv.textContent = results.message;

        } else {
            // normal case - 1 or more results
            // results is an array of objects...
            results.forEach( obj => {
                let div = document.createElement("div");
                div.classList.add("country", "border");
                
                // destructuring assignment
                let { name, alpha2Code, alpha3Code, flag, region, subregion, population, languages } = obj;

                languages = languages.map( i => i.name).join(", ");
                
                div.innerHTML =  `
                    <div class='flex flex2'>
                        <img src=${flag} />
                    </div>
                    <div class='flex flex4'>
                        <p><span class='label'>Country:</span> ${name}</p>
                        <p><span class='label'>Population:</span> ${Intl.NumberFormat().format(population)}</p>
                        <p><span class='label'>Languages:</span> ${languages}</p>
                    </div>
                    <div class='flex flex4'>
                        <p><span class='label'>Country Codes:</span> ${alpha2Code}, ${alpha3Code}</p>
                        <p><span class='label'>Region:</span> ${region}</p>
                        <p><span class='label'>Subregion:</span> ${subregion}</p>
                    </div>
                `;

                



                rsltDiv.appendChild(div);
            });
    
        }


    }

}



window.onload = init;
