##############################################################################
# geocode: Geocode localities to add lat/long/zoom to JSON file
##############################################################################

import json
import urllib
import csv
from collections import OrderedDict

filename = 'localities'
#filename = 'localtest'

Google_API_key = 'AIzaSyCdaPV2sraHHoOIPWOSO6rQSjGJTtDECVY'
gc_base = 'https://maps.googleapis.com/maps/api/geocode/json?'
gc_url = gc_base + 'key=' + Google_API_key + '&region=au&'

#read localities.json
with open(filename + '.json') as locfile:
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
      if len(response['results']) != 1:
        print "Warning" + response['results'].length + " results for locality " + loc['l']

      # Process the response to extract bounding box
      vp = response['results'][0]['geometry']['viewport']
      
      # Define bounding box
      loc['xw'] = vp['southwest']['lng']
      loc['xs'] = vp['southwest']['lat']
      loc['xe'] = vp['northeast']['lng']
      loc['xn'] = vp['northeast']['lat']

    else:
      print "Warning: status " + response['status'] + " geocoding " + addr

  # Add locality to localities
  locs_out.append(loc)
    
#Write localities to json and csv files
with open(filename + '_geocoded.json', 'w') as outfile:
  json.dump(locs_out, outfile)