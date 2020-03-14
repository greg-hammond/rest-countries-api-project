<?php

    // get POST data    
    $search = $_POST['search'];   
    $useExact = isset( $_POST['fullName']);


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



    $baseurl = 'https://restcountries.eu/rest/v2/name/';
    

    // oddness (possible issues with the API itself):
    // - using 'exact match' will match against 2-digit country code, even when doing a 'name' search.
    // 

    // it seems like using 'fullText=true' and field filtering interfere with each other.
    // so I will use one or the other but not both.
    if ($useExact) {
        $fullURL = $baseurl . $search . "?fullText=true";

    } else {
        $fullURL = $baseurl . $search . "?fields=" . implode(";", $fields);
    }

    $curl = curl_init($fullURL);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, TRUE);  // prevent extra "1" in return value

    $json = curl_exec($curl); // execute the API query
    curl_close($curl);


    // convert json to array
    $data = json_decode($json);   

    // if no matches found, the API returns {"status":404, "message":"Not Found"}
    // test for existence of "status" key - and if so, send that up directly as the result.
    if (array_key_exists('status', $data)) {   

        echo $json;

    } else {    // normal handling

        // sort alpha ascending on name
        usort($data, function ($a, $b) {return strcmp($a->name, $b->name);} );

        // limit result set to first 50
        $data = array_slice($data, 0, 50);

        // encode back to json & send up
        echo json_encode($data);  

    };



?>