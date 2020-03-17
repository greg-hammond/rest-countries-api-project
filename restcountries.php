<?php

    // get POST data    
    $search = $_POST['search'];                 // search text
    $useExact = isset( $_POST['fullName']);     // exact match on name?
    $searchBy = $_POST['searchType'];           // 1 = name lookup, 2 = country code lookup


/*--------------------------------------------------------------------------------------------------

notes - oddness / irregularities / comments on API behavior:

- using 'exact match' will match against 2-digit country code, even when doing a 'name' search.
    Not a problem, but seems somewhat incorrect.

- search is not case-sensitive

- some search terms return results that aren't an actual name match.  It appears that the API also
    matches against the "altSpellings" field - without regard for whether I want it to.

- country code search:  sending anything other than 2 or 3 characters will result in 
    {"status":400,"message":"Bad Request"}

- for either type of search, when no results are found, the API returns:
    {"status":404,"message":"Not Found"}

- when performing a name lookup, results are always returned as an array of objects, even when
    there is only one result.  By contrast, when performing a country code lookup - which will 
    only ever return 1 result - that result is sent as a single object, and NOT as an array.
    That requires special handling below.

- it seems like using '?fullText=true' and ?fields filtering interfere with each other...
  so I am doing one or the other but not both.

---------------------------------------------------------------------------------------------------*/


    // --------------------------------------------------------------------------
    // query URL construction

    
    // field names we need to retrieve (API filter)
    $fields = array(
        "name", 
        "alpha2Code", 
        "alpha3Code", 
        "flag", 
        "region", 
        "subregion", 
        "population", 
        "languages"
    );
    
    // from form: 1 = search by name (api path "name");  2 = search by country code (api path "alpha")
    $searchField = ($searchBy == "1") ? "/name/" : "/alpha/";

    $baseurl = 'https://restcountries.eu/rest/v2' . $searchField;


    if ($useExact) {
        // exact name match.  Omit field filtering for this query (see above)
        $fullURL = $baseurl . $search . "?fullText=true";

    } else {
        // partial match.  include field filtering here
        $fullURL = $baseurl . $search . "?fields=" . implode(";", $fields);   // like array.join
    }




    // --------------------------------------------------------------------------
    // make cURL call to query API

    // init cURL session
    $curl = curl_init($fullURL);

    // this prevents an unexpected "1" in api return value
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, TRUE);  

    // execute the query & close
    $json = curl_exec($curl); 
    curl_close($curl);



    // --------------------------------------------------------------------------
    // results handling / processing

    // convert json to array
    $data = json_decode($json);


    // check for error condition or no data returned
    if (array_key_exists('status', $data)) {

        $errCode = $data->status;
        $data->error = true;    // add this flag for easier client-side identification of error condition

        if ($errCode == 400) {
            $data->errMsg = "Invalid request - please try again.";

        } elseif ($errCode == 404) {
            $data->errMsg = "Your search returned no results - please try again.";

        } else {
            $data->errMsg = "An unknown error occurred - please try again.";
        };


        echo json_encode($data);


    } else {    // normal handling

        // country code search returns one object, NOT wrapped in an array.
        // whereas lookup-by-name always returns an array of objects.

        // easiest to just convert to array if needed:
        if (!is_array($data)) {
            $data = array($data);
        }

        // sort alpha ascending on name
        usort($data, function ($a, $b) {return strcmp($a->name, $b->name);} );

        // limit result set to first 50
        $data = array_slice($data, 0, 50);

        // encode back to json & send up
        echo json_encode($data);  

    };


?>