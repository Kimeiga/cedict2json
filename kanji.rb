require 'kanji_chinese_converter'

text = "東京都渋谷区渋谷"
converted_text = KanjiChineseConverter.convert(text)
puts converted_text

KanjiChineseConverter.convert("東京都渋谷区渋谷")
# => "东京都涩谷区涩谷"

KanjiChineseConverter.convert("日本語の文章も漢字のみ変換可能です。")
# => "日本语の文章も汉字のみ变换可能です。"