from nudenet import NudeDetector

def NudityDetector(pathToImage):
    nudityExists = False
    nude_detector = NudeDetector()
    preds = nude_detector.detect(pathToImage)
    for pred in preds:
        if(int(pred["score"]) > 0.5):
            if(pred["class"] == "FEMALE_BREAST_EXPOSED"):
                nudityExists = True
            
            if(pred["class"] == "BUTTOCKS_EXPOSED"):
                nudityExists = True

            if(pred["class"] == "FEMALE_GENITALIA_EXPOSED"):
                nudityExists = True

            if(pred["class"] == "ANUS_EXPOSED"):
                nudityExists = True

            if(pred["class"] == "MALE_GENITALIA_EXPOSED"):
                nudityExists = True

    return nudityExists