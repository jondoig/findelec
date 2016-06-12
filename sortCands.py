###################################################################
# sortCands: Sort candidates: major parties in order, then name
###################################################################

import json

infilename = 'electorates'
#infilename = 'electest'
outfilename = infilename + '_sorted'

#read electorates JSON file
with open(infilename + '.json') as elecfile:
  elecs_in = json.load(elecfile)

elecs_out = {}

# For each electorate
for elec, cands in elecs_in.iteritems():
#  cands.sort(key=lambda x: x.p)
  elecs_out[elec] = sorted(cands)
  elecs_out[elec] = sorted(cands, key=lambda x: x['p'])

#Write sorted electorates to json file
with open(outfilename + '.json', 'w') as outfile:
  json.dump(elecs_out, outfile)