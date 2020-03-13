<?php

    
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

    $fieldStr = "?fields=" . implode(";", $fields);

    $baseurl = 'https://restcountries.eu/rest/v2/name/';
    


    if ($useExact) {
        // user checked 'exact match'
        // field filtering seems to be ignored when we use 'fullText=true'.
        $fullurl = $baseurl . $search . "?fullText=true";

    } else {
        // user did not check exact match.  do normal search, and specify field filter.
        $fullurl = $baseurl . $search . $fieldStr;
    }


    $curl = curl_init($fullurl);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, TRUE);  // prevent extra "1" in return value
    $result = curl_exec($curl); // returns json
    curl_close($curl);

    // @@@@@@@@@@@@@@@@@@@@@ this decode/encode foobars the no-match result.

    // convert json to array
    $result = json_decode($result);   

    // sort alpha ascending on name
    usort($result, function ($a, $b) {return strcmp($a->name, $b->name);} );

    // limit result set to first 50
    $result = array_slice($result, 0, 50);

    // convert back to json
    $result = json_encode($result);  

    // send final result back up
    echo $result;


?>