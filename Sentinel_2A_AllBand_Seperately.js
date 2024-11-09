//OO7-Karim_Respiratory

//Define you Area/Region of interest or add from assets and replace the name "Table" with "roi"
//cloud-masking
function maskS2clouds(image) {
    var qa = image.select('QA60');
  
    var cloudBitMask = 1 << 10;
    var cirrusBitMask = 1 << 11;
  
    var mask = qa.bitwiseAnd(cloudBitMask).eq(0)
        .and(qa.bitwiseAnd(cirrusBitMask).eq(0));
  
    return image.updateMask(mask).divide(10000);
  }
  
  //Sentinel-2 dataset
  var dataset = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
                    .filterDate('2023-01-01', '2023-12-30')
                    .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 5))
                    .map(maskS2clouds);
  
  
  // composit
  var composite = dataset.mean().clip(roi);
  
  var bandNames = composite.bandNames();
  
  // Loop through each band individually and export
  bandNames.evaluate(function(bands) {
    bands.forEach(function(band) {
      Export.image.toDrive({
        image: composite.select([band]), 
        description: 'Sentinel2_' + band + '_Export',
        folder: 'EarthEngineExports',  
        scale: 10,
        region: roi.geometry().bounds(),
        maxPixels: 1e13
      });
    });
  });
  