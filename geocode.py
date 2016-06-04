##############################################################################
# geocode: Geocode localities to add lat/long/zoom to JSON file
##############################################################################

import json
import urllib
import csv
from collections import OrderedDict

#filename = 'localities'
filename = 'localtest'

Google_API_key = 'AIzaSyCdaPV2sraHHoOIPWOSO6rQSjGJTtDECVY'
gc_base = 'https://maps.googleapis.com/maps/api/geocode/json?'
gc_url = gc_base + 'key=' + Google_API_key + '&region=au&'

#class Extent:
#  def __init__(self, west, south, east, north):
#    self.w = west
#    self.s = south
#    self.e = east
#    self.n = north

#class Locality:
#  def __init__(self, state, loc, pc, elec, redist, other, west, south, east, north):
#    self.s = state
#    self.l = loc
#    self.p = pc
#    self.e = elec
#    self.r = redist
#    self.o = other
#    self.xw = west
#    self.xs = south
#    self.xe = east
#    self.xn = north

#read localities.json
with open(filename + '.json') as locfile:
  locs_in = json.load(locfile)

locs_out = []

# For each locality without an explicit electorate...
for loc in locs_in:
#  if ("e" in loc):
#    loc = Locality(loc['s'] or '', loc['l'] or '', loc['p'] or '',
#                   loc['e'] or '', loc['r'] or '', loc['o'] or '', '')
        

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
      #      print "vp = " + str(vp)
      
      # Define bounding box
#      x = Extent(vp['southwest']['lng'], vp['southwest']['lat'],
#                 vp['northeast']['lng'], vp['northeast']['lat'])

      loc['xw'] = vp['southwest']['lng']
      loc['xs'] = vp['southwest']['lat']
      loc['xe'] = vp['northeast']['lng']
      loc['xn'] = vp['northeast']['lat']

#      print "x.e = " + str(x.e)
      
      # Add bounding box to locality
      #      loc = Locality(loc['s'], loc['l'], loc['p'], '', '', '', x)
      
#      setattr(loc, 'x', x)
#      loc.x = x
#      print "loc = " + str(loc)
#      print "loc = " + loc.l
    else:
      print "Warning: status " + response['status'] + " geocoding " + addr

  # Add locality to localities
  locs_out.append(loc)
    
#print "localities = " + str(locs_out)
    
#Write localities to json and csv files
with open(filename + '_geocoded.json', 'w') as outfile:
  json.dump(locs_out, outfile)
#  json.dump([OrderedDict([loc['l'], loc['p'], loc['e']]) for loc in locs_out], outfile)

#with open(filename + '_geocoded.csv', 'w') as csvfile:
#  writer = csv.writer(csvfile, delimiter='\t')
##  writer.writerow(["p", "l", "e", "s", "xw", "xs", "xe", "xn"])
##  writer.writerow(dict(locs_out[0]).keys())
#  writer.writerows(dict(loc).values() for loc in locs_out)