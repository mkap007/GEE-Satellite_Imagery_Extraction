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
                    .filterDate('2020-01-01', '2020-01-30')
                    .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))
                    .map(maskS2clouds);
  
  // Set the visualization
  var visualization = {
    min: 0.0,
    max: 0.3,
    bands: ['B8', 'B4', 'B3'],
  };
  
  // Set Layers
  Map.centerObject(roi, 12);
  Map.addLayer(dataset.mean().clip(roi), visualization, 'RGB');
  
  // Create a composite
  var composite = dataset.mean().clip(roi);
  
  // Export composit
  Export.image.toDrive({
    image: composite,
    description: 'Sentinel2_Composite_Export',
    folder: 'EarthEngineExports', 
    scale: 10,
    region: roi.geometry().bounds(),
    maxPixels: 1e13
  });
  