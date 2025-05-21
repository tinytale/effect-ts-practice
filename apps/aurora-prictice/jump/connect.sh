RDS_HOST=aurora-severless-debug.cluster-crq6c0uwutza.ap-northeast-1.rds.amazonaws.com

# --wait-until=runningでTaskが起動するまで待つ
ecspresso run --wait-until=running

# 最新のTask IDを取得
id=$(
    ecspresso tasks --output=json | \
    jq -r '.containers[0].taskArn | split("/")[2]' | \
    head -1 \
)

# ポートフォワードする
ecspresso exec \
  --port-forward \
  -L 5432:$RDS_HOST:5432 \
  --id $id