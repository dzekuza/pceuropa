/bin/bash
Upload all tenant-assets to the new Supabase project.
Usage: bash scripts/upload-storage.sh ***REDACTED_SERVICE_ROLE_KEY***

SERVICE_ROLE_KEY="${1:?Usage: $0 ***REDACTED_SERVICE_ROLE_KEY***}"
NEW_PROJECT="ukmxbzuechxpinrythis"
BASE_URL="https://${NEW_PROJECT}.supabase.co/storage/v1/object/tenant-assets"
LOCAL="/tmp/pceuropa-storage"

FILES=(
  "gallery/1780587665323-p01t11ywmh.jpg"
  "gallery/1780587736842-1ijoc0gctym.jpg"
  "gallery/1c282578-b5f0-44ad-ab46-e81c703a5fd8.jpg"
  "gallery/2530cbf9-303b-43f6-891b-f296f5461002.jpg"
  "gallery/57ce7474-4674-459f-8506-07c112cabcf6.jpg"
  "logos/05b3aa03-284b-4f55-bfc8-caf95c1daf3c.png"
  "logos/114b2360-bf4a-4ad3-a455-f2f489d63e2e.png"
  "logos/17069e1b-b8fe-4765-979f-e839c81aef7d.png"
  "logos/1780587661894-yacveryo4tj.png"
  "logos/1780587733469-vweilm581e.png"
  "logos/1fd6185b-0f51-4c05-9aa6-82c7c35e5d74.png"
  "logos/4ed3454d-9496-420f-bfb4-740cca65a4ce.jpg"
  "logos/55cf36b8-a378-46f5-a9e9-2c1ae5259f51.png"
  "logos/5cce7907-7866-46bd-ade5-68dd477a72c6.png"
  "logos/5f15141e-df98-477b-8dac-29087f8c9aef.png"
  "logos/677c6057-ac50-4e8b-b024-0f25e51297b7.png"
  "logos/7ae56de9-1566-47e6-a9a2-44547e1b86d2.png"
  "logos/7db53410-5509-445d-adad-6ab4f3b829d7.png"
  "logos/81ebd7ed-cced-48af-bd9d-3d7709f4754d.png"
  "logos/8602ba5c-2bcb-4944-96fb-e67d9e687e9c.png"
  "logos/86bba9d2-8b93-47ab-b5d7-e5d842cdcb8a.png"
  "logos/8e6d8fd0-648f-44dc-8370-ae5e9ead476a.png"
  "logos/8fefcd65-64b4-4dce-9b3a-fc415c273760.png"
  "logos/90a79d75-49c0-448e-889b-702573a264a1.png"
  "logos/9952b940-c41b-4805-b4a4-ec50ec787272.png"
  "logos/a8cd188a-bd74-4cc9-b4a1-9f251115668c.png"
  "logos/a9fdc40d-7436-4cf5-9a04-9d282aae3f19.png"
  "logos/ae85f077-5a3e-491e-86e0-f9c079fea25e.png"
  "logos/af5d5e70-03d3-4cd3-ad53-7b3b8a22a343.png"
  "logos/b7e7fa88-87e8-4179-b2be-47f7fc7dcd19.png"
  "logos/c9d34e3e-7a90-4a3e-97c9-be08610e8af7.png"
  "logos/d5dd7fbb-f967-49d5-b479-9386804ec389.png"
  "logos/dd50544b-39bd-4494-a5d2-cfdd3cd9912b.png"
  "logos/dfa27694-f2a7-40c4-95e1-63312c5ddd71.png"
  "logos/e206c2e5-21d6-40d7-895d-8c81ee1fcae2.png"
  "logos/e694db3a-bf79-47d4-9590-7395034a5564.png"
  "logos/e9dd48b3-fe49-43ac-8f4b-9bb6335e4529.png"
  "logos/ef2d25c4-c5b6-4067-a82e-5068de445f8a.png"
  "logos/fab783b5-32c3-40ff-8766-ba632b3b362f.png"
)

PASSED=0; FAILED=0
for f in "${FILES[@]}"; do
  mime=$(file --mime-type -b "$LOCAL/$f")
  http_code=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
    "${BASE_URL}/${f}" \
    -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
    -H "Content-Type: ${mime}" \
    -H "x-upsert: true" \
    --data-binary "@${LOCAL}/${f}")
  if [[ "$http_code" == "200" ]] || [[ "$http_code" == "201" ]]; then
    echo "✓ $f"
    PASSED=$((PASSED+1))
  else
    echo "✗ $f (HTTP $http_code)"
    FAILED=$((FAILED+1))
  fi
done
echo ""
echo "Done: $PASSED uploaded, $FAILED failed"
