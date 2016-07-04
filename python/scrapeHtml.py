##############################################################################
# scrapeHtml: Extract locality data from AEC postcode search results
##############################################################################

from lxml import html
import requests
import os
import unicodedata
import json
import csv

#### Code to GET local file. Cribbed from https://stackoverflow.com/questions/10123929/python-requests-fetch-a-file-from-a-local-url/22989322#22989322
from requests_testadapter import Resp

warnfile = open("scrapeHTMLWarnings.txt", "w")

class LocalFileAdapter(requests.adapters.HTTPAdapter):
    def build_response_from_file(self, request):
        file_path = request.url[7:]
        with open(file_path, 'rb') as file:
            buff = bytearray(os.path.getsize(file_path))
            file.readinto(buff)
            resp = Resp(buff)
            r = self.build_response(request, resp)

            return r

    def send(self, request, stream=False, timeout=None,
             verify=True, cert=None, proxies=None):

        return self.build_response_from_file(request)

requests_session = requests.session()
requests_session.mount('file://', LocalFileAdapter())

#### End crib
#path = 'html/postcodes/'
path = 'html/posttest/'
files = os.listdir(path)

class Locality:
  def __init__(self, state, loc, pc, elec, redist, other):
    self.s = state
    self.l = loc
    self.p = pc
    self.e = elec
    self.r = redist
    self.o = other

localities = []

for file in files:
  page = requests_session.get('file://' + path + file)

  #page = requests.get('http://apps.aec.gov.au/eSearch/LocalitySearchResults.aspx?filter=2600&filterby=Postcode')

  tree = html.fromstring(page.content)
  
  tablePath = '//table[@id="ContentPlaceHolderBody_gridViewLocalities"]'

  rows = tree.xpath(tablePath + '/tr')
  rows.pop(0) # Remove table header row

  #... process manually if multi pages
  if tree.xpath(tablePath + '/tr[@class="pagingLink"]') != []:
    warnfile.write(file + " contains additional results. Add manually.\n")
    rows.pop() # Remove pagingLink row so it is not treated as a locality

  for r in rows:
    r[4].text = "" if r[4].text is None else str(r[4][0].text)
    r[5].text = "" if r[5].text is None else str(unicodedata.normalize('NFKD', r[5].text)).strip()
    
    l = Locality(str(r[0].text).strip(), str(r[1].text), str(r[2][0].text), str(r[3][0].text), r[4].text, r[5].text)
    print l.l
    localities.append(l)
    
with open('localities.json', 'w') as outfile:
  json.dump([l.__dict__ for l in localities], outfile)

with open('localities.csv', 'w') as csvfile:
  writer = csv.writer(csvfile, delimiter='\t')
  writer.writerows(l.__dict__.values() for l in localities)