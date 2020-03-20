"use strict";

const init = () => {

    const form = document.getElementById("theForm");
    const rsltDiv = document.getElementById("results");
    
    // initialize focus on text input field
    document.getElementById("search").focus();



    // =======================================================================
    // perform the backend call (php -> REST API) to run the search
    // uses async/await - returns a promise
    //
    const runSearch = async formData => {

        const resp = await fetch("restcountries.php", {
            method: "POST",
            body: formData
        });

        const rslt = await resp.json();
        return rslt;
    }
    

    // =======================================================================
    //  set summary data at bottom of page
    //
    const setSummary = (count, regions, subregions) => {

        document.getElementById("result-count").textContent = count;
        document.getElementById("region-list").textContent = regions;
        document.getElementById("subregion-list").textContent = subregions;

    }
    


    //=============================================================================
    // getSummaryString - build summary count data - helper function
    //
    // input: object    obj[key_i] = count_i
    // output: string   key1 (cnt1) | key2 (cnt2) | key3 (cnt3) ...
    // sorted by descending count
    //
    const getSummaryString = countObj => {

        return Object.keys(countObj)
        .sort( (a, b) => {
            return ( countObj[b] - countObj[a] )
        })
        .map( i => ` ${i} (${countObj[i]}) `)
        .join("|");

    };



    // =======================================================================
    // clear page
    //
    const clearResults = () => {
        // clear any prior results / state
        rsltDiv.classList.remove("errorState");
        while (rsltDiv.firstChild) {
            rsltDiv.firstChild.remove();
        }
        setSummary("", "", "");
    }




    // =======================================================================
    // form "submit" handling
    // 
    form.addEventListener("submit", evt => {

        evt.preventDefault();       // cancel actual form submission

        // perform client-side form validation prior to submitting to server

        const formData = new FormData(form);    
        const srch = formData.get("search");

        clearResults();


        // check for blank search field
        if (!srch) {
            showErrorResult("Please enter a search term.");
            return;         // get out
        }

        // check for valid country code search entry (2 or 3 characters required)
        if (formData.get("searchType") == 2) { 
            if (srch.length < 2 || srch.length > 3) {
                showErrorResult("Country code search must be 2 or 3 characters long.");
                return;     // get out
            }
        }

        // run the search
        runSearch(formData)
        .then( json => showResults(json));

    })
    


    //==============================================================================
    //    
    const showErrorResult = errText => {
        rsltDiv.classList.add("errorState");
        rsltDiv.textContent = errText;
    }



    // =======================================================================
    // build out the display with the API json results
    //
    const showResults = results => {
        
        // handle errors returned from API call
        if (results.error) {        
            showErrorResult(results.errMsg);
            return;

        // normal case - we have data to show
        } else {

            const nf = new Intl.NumberFormat();  // use for thousands separators below
            let countryCount = 0, regCount = {}, subCount = {};

            results.forEach( obj => {

                let div = document.createElement("div");
                div.classList.add("country");
                
                // destructuring assignment
                let { name, alpha2Code, alpha3Code, flag, region, subregion, population, languages } = obj;

                languages = languages.map( i => i.name).join(", ");

                // aggregate summary data
                countryCount++;
                (regCount[region]) ? regCount[region]++ : regCount[region] = 1;
                (subCount[subregion]) ? subCount[subregion]++ : subCount[subregion] = 1; 
                

                div.innerHTML =  `
                    <div class='flex flex2'>
                        <img src=${flag} />
                    </div>
                    <div class='flex flex4'>
                        <p><span class='label'>Country:</span> ${name}</p>
                        <p><span class='label'>Population:</span> ${nf.format(population)}</p>
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

            //Build content for bottom summary
            setSummary(countryCount, getSummaryString(regCount), getSummaryString(subCount));

        }

    }

}



window.onload = init;
