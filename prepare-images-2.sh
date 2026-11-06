#!/bin/bash
# Turns your original photos into web-ready JPGs, sorted into the right album folders.
# Mac only (uses the built-in "sips" tool).
#
# Usage:  bash prepare-images.sh "/path/to/folder/with/your/original/photos"

SRC="${1:-.}"
OUT="$(cd "$(dirname "$0")" && pwd)/images"
mkdir -p "$OUT"
shopt -s nullglob nocaseglob

# Which album each photo belongs to (names in lowercase, spaces -> _, no brackets)
album_for() {
  case "$1" in
    img_5426|img_5430|img_5433|img_5436|img_5466|img_5721|img_5756)
      echo "pey-networking-events" ;;
    _mg_goenggirl|_mg_5454|_mg_5669|_mg_5677|_mg_5682|img_6785|img_6793|img_6828)
      echo "go-eng-girl" ;;
    img_1011|dsc01608|img_4860|img_4866|img_4885)
      echo "nvidia-x-wise" ;;
    img_6893|img_6914_2|img_6922_2|img_6939|img_6954_2|img_7017|img_7099|img_7264)
      echo "sickkids-ssure" ;;
    mateoshoot1|mateoshoot2|sabaa_rashid_2|xinran_xu_2|photo2|img_0926|img_0931)
      echo "hart-house-exhibit" ;;
    _mg_5707|_mg_5708|photo1)
      echo "girls-in-med-research" ;;
    *) echo "unsorted" ;;
  esac
}

# Photos that ALSO go on the main page grid (images/featured)
is_featured() {
  case "$1" in
    img_1011|mateoshoot1|_mg_5708|img_5430|img_0931|img_6939|sabaa_rashid_2|img_4885|img_0926|_mg_5677|img_5721|img_7264) return 0 ;;
    *) return 1 ;;
  esac
}

count=0
for f in "$SRC"/*.{jpg,jpeg,png,heic,cr2}; do
  base="$(basename "$f")"
  name="${base%.*}"
  clean="$(printf '%s' "$name" | tr ' ' '_' | tr -d '()')"
  key="$(printf '%s' "$clean" | tr 'A-Z' 'a-z')"
  folder="$(album_for "$key")"
  mkdir -p "$OUT/$folder"
  if sips -s format jpeg -s formatOptions 85 -Z 2000 "$f" --out "$OUT/$folder/$clean.jpg" >/dev/null 2>&1; then
    echo "ok    $base  ->  images/$folder/$clean.jpg"
    count=$((count+1))
    if is_featured "$key"; then
      mkdir -p "$OUT/featured"; cp "$OUT/$folder/$clean.jpg" "$OUT/featured/$clean.jpg"
    fi
    if [ "$key" = "photo2" ]; then
      mkdir -p "$OUT/about"; cp "$OUT/$folder/$clean.jpg" "$OUT/about/$clean.jpg"
    fi
  else
    echo "FAIL  $base"
  fi
done

echo ""
echo "Done: $count photos converted. Folder summary:"
for d in "$OUT"/*/; do echo "  $(ls "$d" | wc -l | tr -d ' ') photos in images/$(basename "$d")"; done
