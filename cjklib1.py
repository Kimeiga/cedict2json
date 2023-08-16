# coding=utf-8

from cjklib.characterlookup import CharacterLookup


def kanji_to_hanzi(kanji):
    # Create a character lookup object for Traditional Chinese
    cjk = CharacterLookup("T")

    # Get the traditional Chinese variants of the kanji
    variants = cjk.getVariants(kanji)

    # Filter out the variants to get the traditional Chinese form
    # Note: This assumes the first traditional variant is the desired mapping.
    for variant in variants:
        if cjk.isSimplifiedChinese(variant):
            continue
        return variant
    return None


# Test
kanji_example = "学"  # The Japanese kanji for "study"
print(kanji_to_hanzi(kanji_example))
