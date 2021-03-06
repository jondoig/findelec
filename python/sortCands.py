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

# Sort majors first, then by party, then by name
def compareCand(a, b):
  majors = ['Greens', 'Labor', 'CLP', 'Lib', 'LNP', 'Nat']

#  print "  Sorting " + a['n'] + " and " + b['n']
  if a['p'] in majors and not b['p'] in majors:
    return -1
  elif b['p'] in majors and not a['p'] in majors:
    return 1
  elif a['p'] == b['p']:
    if a['n'] < b['n']:
      return -1
    else:
      return 1
  elif a['p'] in majors and b['p'] in majors:
    if majors.index(a['p']) < majors.index(b['p']):
      return -1
    else:
      return 1
  else:
    if a['p'] < b['p']:
      return -1
    else:
      return 1

# For each electorate, sort candidates
for k, v in elecs_in.iteritems():
#  print k, sorted(v['c'], cmp=compareCand)
  v['c'].sort(cmp=compareCand)
  elecs_out[k] = v
#  elecs_out[elec] = sorted(cands, cmp=compareCand)

#Write sorted electorates to json file
with open(outfilename + '.json', 'w') as outfile:
  json.dump(elecs_out, outfile)