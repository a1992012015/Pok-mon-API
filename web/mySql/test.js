
import elasticsearch from 'elasticsearch';

const esClient = new elasticsearch.Client({
    host: '119.27.168.74:3306',
    log: 'error'
});

const search = (index, body) => {
    return esClient.search({index: index, body: body});
};