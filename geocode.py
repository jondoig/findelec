##############################################################################
# geocode: Geocode localities to add lat/long/zoom to JSON file
##############################################################################

import json
import urllib

infilename = 'localities'
#infilename = 'localtest'
outfilename = infilename + '_geocoded'

Google_API_key = 'AIzaSyCdaPV2sraHHoOIPWOSO6rQSjGJTtDECVY'
gc_base = 'https://maps.googleapis.com/maps/api/geocode/json?'
gc_url = gc_base + 'key=' + Google_API_key + '&region=au&'

#read localities JSON file
with open(infilename + '.json') as locfile:
  locs_in = json.load(locfile)

locs_out = []

# For each locality without an explicit electorate...
for loc in locs_in:
        

  if not ("e" in loc):
    # Send a Google geocode request like this:
    #https://maps.googleapis.com/maps/api/geocode/json?region=au&address=HOLTZE,%20NT%200829&key=AIzaSyCdaPV2sraHHoOIPWOSO6rQSjGJTtDECVY
    addr = loc['l'] + ", " + loc['s'] + " " + loc['p']
    request_url = gc_url + urllib.urlencode({"address": addr})
    response = json.load(urllib.urlopen(request_url))
    if response['status'] == 'OK':
#      if len(response['results']) != 1:
#        print "Warning - multiple results for locality " + loc['l'] + ":"
#        for res in response['results']:
#          print "  " + res['formatted_address']
      
      vp = None
      error = False
      address = loc['l'].title() + " " + loc['s'] + " " + loc['p'] + ", Australia"

      for res in response['results']:
        if res['formatted_address'] == address:
          # Extract bounding box
#          print "Using: " + res['formatted_address']
          vp = res['geometry']['viewport']

      # If no exact match, try again without postcode
      if vp is None:
        for res in response['results']:
          if res['formatted_address'] == address.replace(" " + loc['p'], ""):
            print "Missing postcode but using: " + res['formatted_address']
            vp = res['geometry']['viewport']

      # If still no match, use first result but issue warning
      if vp is None:
        print "WARNING - No exact match: " + address
        res = response['results'][0]
        for comp in res['address_components']:
          if "postal_code" in comp['types']:
            if comp['long_name'] != loc['p']:
              print "  ERROR - postcode mismatch: " + res['formatted_address']
              error = True
              
        if not error:
          print "  Using " + res['formatted_address']
          vp = res['geometry']['viewport']

      if not error:
        # Define bounding box
        loc['xw'] = vp['southwest']['lng']
        loc['xs'] = vp['southwest']['lat']
        loc['xe'] = vp['northeast']['lng']
        loc['xn'] = vp['northeast']['lat']

    else:
      print "ERROR: status " + response['status'] + " geocoding " + addr

  # Add locality to localities
  locs_out.append(loc)
    
#Write localities to json file
with open(outfilename + '.json', 'w') as outfile:
  json.dump(locs_out, outfile)