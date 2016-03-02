#!/usr/bin/env python3
#encoding: UTF-8

import json
import glob


def main():
    searches = []
    for geojson_file in glob.glob('./data/*.json'):
        with open(geojson_file, 'r') as geojson:
            content = json.load(geojson)
            for feature in content['features']:
                searchText = []
                for geojson_property in feature['properties'].values():
                    if geojson_property:
                        searchText.append(str(geojson_property))
                del feature['properties']
                searches.append({
                    'feature': feature,
                    'searchText': ', '.join(searchText)
                })

    with open('./searches.json', 'w') as searches_file:
        json.dump(searches, searches_file)


if __name__ == "__main__":
    main()
