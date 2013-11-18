import sys
import csv

if(len(sys.argv) > 1):
  with open(sys.argv[1], 'rb') as csvfile:
    with open(sys.argv[2], 'wb') as outfile:
      writer = csv.writer(outfile, delimiter=',')
      reader = csv.reader(csvfile, delimiter=',')
      for row in reader:
        print ', '.join(row)
        if( raw_input() == 'a'):
          writer.writerow(row)
